using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RotaryClubManager.API.Services;
using RotaryClubManager.API.Models;
using RotaryClubManager.API.Dtos;
using RotaryClubManager.API.Utils;

namespace RotaryClubManager.API.Controllers
{
    [Route("api/clubs/{clubId}/commissions")]
    [ApiController]
    public class MembresCommissionController : ControllerBase
    {
        private readonly RotaryClubManagerContext _context;
        private readonly ILogger<MembresCommissionController> _logger;
        private readonly ITenantService _tenantService;

        public MembresCommissionController(RotaryClubManagerContext context, ILogger<MembresCommissionController> logger, ITenantService tenantService)
        {
            _context = context;
            _logger = logger;
            _tenantService = tenantService;
        }

        // POST: api/clubs/{clubId}/commissions/{commissionClubId}/membres
        // Affecter un membre à une commission
        [HttpPost]
        [Authorize(Roles = "Admin,President,Secretary")]
        public async Task<IActionResult> AffecterMembreCommission(
            Guid clubId,
            Guid commissionClubId,
            [FromBody] AffecterMembreCommissionRequest request)
        {
            try
            {
                // Validation de base de la requête
                if (request == null)
                {
                    return BadRequest("La requête ne peut pas être nulle");
                }

                if (string.IsNullOrEmpty(request.MembreId))
                {
                    return BadRequest("L'identifiant du membre est requis");
                }

                // Vérifier les autorisations
                if (!await CanManageClub(clubId))
                {
                    return Forbid("Vous n'avez pas l'autorisation de gérer ce club");
                }

                // Définir le tenant actuel
                _tenantService.SetCurrentTenantId(clubId);

                // Vérifier que la commission appartient bien au club et est active
                var commissionClub = await _context.CommissionsClub
                    .Include(cc => cc.Commission)
                    .Include(cc => cc.Club)
                    .FirstOrDefaultAsync(cc => cc.Id == commissionClubId && cc.ClubId == clubId);

                if (commissionClub == null)
                {
                    return NotFound("Commission non trouvée dans ce club");
                }

                if (!commissionClub.EstActive)
                {
                    return BadRequest("Impossible d'affecter un membre à une commission inactive");
                }

                // Vérifier que l'utilisateur existe et est membre actif du club
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == request.MembreId && 
                                            u.PrimaryClubId == clubId && 
                                            u.IsActive);

                if (user == null)
                {
                    return NotFound("Membre non trouvé dans ce club ou membre inactif");
                }

                // Vérifier que le mandat existe et appartient au club
                var mandat = await _context.Mandats
                    .FirstOrDefaultAsync(m => m.Id == request.MandatId && m.ClubId == clubId);

                if (mandat == null)
                {
                    return NotFound("Mandat non trouvé pour ce club");
                }

                // Vérifier si le membre n'est pas déjà affecté à cette commission pour ce mandat
                var existingAffectation = await _context.MembresCommission
                    .FirstOrDefaultAsync(mc => mc.MembreId == request.MembreId &&
                                             mc.CommissionClubId == commissionClubId &&
                                             mc.MandatId == request.MandatId &&
                                             mc.EstActif);

                if (existingAffectation != null)
                {
                    return BadRequest($"Le membre est déjà affecté à cette commission pour le mandat {mandat.Annee}");
                }

                // Vérifier les contraintes de responsabilité
                if (request.EstResponsable)
                {
                    var existingResponsable = await _context.MembresCommission
                        .AnyAsync(mc => mc.CommissionClubId == commissionClubId &&
                                      mc.MandatId == request.MandatId &&
                                      mc.EstResponsable &&
                                      mc.EstActif);

                    if (existingResponsable)
                    {
                        return BadRequest("Il y a déjà un responsable pour cette commission dans ce mandat. " +
                                        "Veuillez d'abord retirer le responsable actuel ou ne pas définir ce membre comme responsable.");
                    }
                }

                // Créer l'affectation
                var membreCommission = new MembreCommission
                {
                    Id = Guid.NewGuid(),
                    MembreId = request.MembreId,
                    CommissionClubId = commissionClubId,
                    MandatId = request.MandatId,
                    EstResponsable = request.EstResponsable,
                    DateNomination = request.DateNomination?.ToUniversalTime() ?? DateTime.UtcNow,
                    EstActif = true,
                    Commentaires = request.Commentaires
                };

                _context.MembresCommission.Add(membreCommission);
                await _context.SaveChangesAsync();

                // Charger les données pour la réponse
                var membreCommissionCree = await _context.MembresCommission
                    .Include(mc => mc.Membre)
                    .Include(mc => mc.Mandat)
                    .FirstOrDefaultAsync(mc => mc.Id == membreCommission.Id);

                if (membreCommissionCree == null)
                {
                    throw new InvalidOperationException("L'affectation a été créée mais n'a pas pu être récupérée");
                }

                var response = new MembreCommissionDetailDto
                {
                    Id = membreCommissionCree.Id,
                    MembreId = membreCommissionCree.MembreId,
                    NomCompletMembre = $"{membreCommissionCree.Membre.FirstName} {membreCommissionCree.Membre.LastName}",
                    EmailMembre = membreCommissionCree.Membre.Email,
                    EstResponsable = membreCommissionCree.EstResponsable,
                    EstActif = membreCommissionCree.EstActif,
                    DateNomination = membreCommissionCree.DateNomination,
                    DateDemission = membreCommissionCree.DateDemission,
                    Commentaires = membreCommissionCree.Commentaires,
                    MandatId = membreCommissionCree.MandatId,
                    MandatAnnee = membreCommissionCree.Mandat.Annee,
                    MandatDescription = membreCommissionCree.Mandat.Description
                };

                _logger.LogInformation(
                    "Membre {MembreId} affecté à la commission {CommissionNom} du club {ClubId} pour le mandat {MandatAnnee} {Role}",
                    request.MembreId,
                    commissionClub.Commission.Nom,
                    clubId,
                    mandat.Annee,
                    request.EstResponsable ? "en tant que responsable" : "en tant que membre"
                );

                return CreatedAtAction(
                    nameof(GetMembreCommission),
                    new { clubId, commissionClubId, membreCommissionId = membreCommission.Id },
                    response
                );
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Erreur de base de données lors de l'affectation du membre {MembreId} à la commission {CommissionClubId}",
                    request?.MembreId, commissionClubId);
                return StatusCode(500, "Une erreur est survenue lors de l'enregistrement dans la base de données");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'affectation du membre {MembreId} à la commission {CommissionClubId}",
                    request?.MembreId, commissionClubId);
                return StatusCode(500, "Une erreur est survenue lors de l'affectation du membre");
            }
        }

        // GET: api/clubs/{clubId}/commissions/{commissionClubId}/membres
        [HttpGet]
        public async Task<IActionResult> GetMembresCommission(Guid clubId, [FromRoute] string commissionClubId)
        {
            try
            {
                // Validation des paramètres
                if (clubId == Guid.Empty)
                {
                    return BadRequest("L'identifiant du club est invalide");
                }

                // Si commissionClubId est undefined, retourner une liste vide
                if (string.IsNullOrEmpty(commissionClubId) || commissionClubId.ToLower() == "undefined")
                {
                    return Ok(new
                    {
                        Commission = new
                        {
                            Id = Guid.Empty,
                            Nom = string.Empty,
                            Description = string.Empty,
                            EstActive = false,
                            NotesSpecifiques = string.Empty
                        },
                        Club = new
                        {
                            Id = clubId,
                            Name = string.Empty,
                            Code = string.Empty
                        },
                        Membres = new List<MembreCommissionDetailDto>(),
                        Statistiques = new
                        {
                            TotalMembres = 0,
                            MembresActifs = 0,
                            Responsables = 0,
                            MembresInactifs = 0
                        }
                    });
                }

                // Tenter de convertir l'ID en Guid
                if (!Guid.TryParse(commissionClubId, out Guid commissionId))
                {
                    return BadRequest("L'identifiant de la commission n'est pas dans un format valide");
                }

                // Vérifier les autorisations
                if (!await CanAccessClub(clubId))
                {
                    return Forbid("Accès non autorisé à ce club");
                }

                // Définir le tenant actuel
                _tenantService.SetCurrentTenantId(clubId);

                // Vérifier que la commission appartient bien au club
                var commissionClub = await _context.CommissionsClub
                    .Include(cc => cc.Commission)
                    .Include(cc => cc.Club)
                    .FirstOrDefaultAsync(cc => cc.Id == commissionId && cc.ClubId == clubId);

                if (commissionClub == null)
                {
                    return NotFound($"Commission avec l'ID {commissionId} non trouvée dans le club {clubId}");
                }

                // Récupérer tous les membres de cette commission
                var membres = await _context.MembresCommission
                    .Include(mc => mc.Membre)
                    .Include(mc => mc.Mandat)
                    .Where(mc => mc.CommissionClubId == commissionId)
                    .OrderBy(mc => mc.Membre.LastName)
                    .ThenBy(mc => mc.Membre.FirstName)
                    .Select(mc => new MembreCommissionDetailDto
                    {
                        Id = mc.Id,
                        MembreId = mc.MembreId,
                        NomCompletMembre = $"{mc.Membre.FirstName} {mc.Membre.LastName}",
                        EmailMembre = mc.Membre.Email,
                        EstResponsable = mc.EstResponsable,
                        EstActif = mc.EstActif,
                        DateNomination = mc.DateNomination,
                        DateDemission = mc.DateDemission,
                        Commentaires = mc.Commentaires,
                        MandatId = mc.MandatId,
                        MandatAnnee = mc.Mandat.Annee,
                        MandatDescription = mc.Mandat.Description
                    })
                    .ToListAsync();

                var response = new
                {
                    Commission = new
                    {
                        Id = commissionClub.Id,
                        Nom = commissionClub.Commission.Nom,
                        Description = commissionClub.Commission.Description,
                        EstActive = commissionClub.EstActive,
                        NotesSpecifiques = commissionClub.NotesSpecifiques
                    },
                    Club = new
                    {
                        Id = commissionClub.Club.Id,
                        Name = commissionClub.Club.Name,
                        Code = commissionClub.Club.Code
                    },
                    Membres = membres,
                    Statistiques = new
                    {
                        TotalMembres = membres.Count,
                        MembresActifs = membres.Count(m => m.EstActif),
                        Responsables = membres.Count(m => m.EstResponsable && m.EstActif),
                        MembresInactifs = membres.Count(m => !m.EstActif)
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des membres de la commission {CommissionClubId} du club {ClubId}", 
                    commissionClubId, clubId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des membres");
            }
        }

        private async Task<bool> CanManageClub(Guid clubId)
        {
            // Implement the logic to check if the user can manage the club
            // This is a placeholder and should be replaced with the actual implementation
            return true; // Placeholder return, actual implementation needed
        }

        private async Task<bool> CanAccessClub(Guid clubId)
        {
            // Implement the logic to check if the user can access the club
            // This is a placeholder and should be replaced with the actual implementation
            return true; // Placeholder return, actual implementation needed
        }
    }
} 