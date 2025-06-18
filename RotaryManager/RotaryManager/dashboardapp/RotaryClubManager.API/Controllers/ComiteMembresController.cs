using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RotaryClubManager.API.Services;
using RotaryClubManager.API.Models;
using RotaryClubManager.API.Dtos;
using RotaryClubManager.API.Utils;

namespace RotaryClubManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComiteMembresController : ControllerBase
    {
        private readonly ILogger<ComiteMembresController> _logger;
        private readonly RotaryClubManagerDbContext _context;
        private readonly ITenantService _tenantService;

        public ComiteMembresController(ILogger<ComiteMembresController> logger, RotaryClubManagerDbContext context, ITenantService tenantService)
        {
            _logger = logger;
            _context = context;
            _tenantService = tenantService;
        }

        [HttpPut("{comiteMembreId:guid}")]
        [Authorize(Roles = "Admin,President,Secretary")]
        public async Task<IActionResult> ModifierAffectationMembre(
            Guid clubId,
            Guid comiteId,
            Guid comiteMembreId,
            [FromBody] ModifierAffectationComiteRequest request)
        {
            try
            {
                // Validation des paramètres
                if (clubId == Guid.Empty)
                {
                    return BadRequest("L'identifiant du club est invalide");
                }

                if (comiteId == Guid.Empty)
                {
                    return BadRequest("L'identifiant du comité est invalide");
                }

                if (comiteMembreId == Guid.Empty)
                {
                    return BadRequest("L'identifiant du membre comité est invalide");
                }

                if (!await CanManageClub(clubId))
                {
                    return Forbid("Vous n'avez pas l'autorisation de gérer ce club");
                }

                _tenantService.SetCurrentTenantId(clubId);

                var comiteMembre = await _context.ComiteMembres
                    .Include(cm => cm.Membre)
                    .Include(cm => cm.Fonction)
                    .Include(cm => cm.Comite)
                        .ThenInclude(c => c.Mandat)
                    .FirstOrDefaultAsync(cm => cm.Id == comiteMembreId &&
                                             cm.ComiteId == comiteId &&
                                             cm.Comite.Mandat.ClubId == clubId);

                if (comiteMembre == null)
                {
                    return NotFound("Affectation de membre non trouvée");
                }

                // Vérifier que la nouvelle fonction existe si spécifiée
                if (request.FonctionId.HasValue)
                {
                    var fonction = await _context.Fonctions
                        .FirstOrDefaultAsync(f => f.Id == request.FonctionId.Value);

                    if (fonction == null)
                    {
                        return NotFound("Fonction non trouvée");
                    }

                    // Vérifier si la fonction a réellement changé
                    if (comiteMembre.FonctionId != request.FonctionId.Value)
                    {
                        var ancienneFonction = comiteMembre.Fonction.NomFonction;
                        comiteMembre.FonctionId = request.FonctionId.Value;
                        _context.Entry(comiteMembre).State = EntityState.Modified;
                        await _context.SaveChangesAsync();

                        // Recharger les données mises à jour
                        comiteMembre = await _context.ComiteMembres
                            .Include(cm => cm.Membre)
                            .Include(cm => cm.Fonction)
                            .FirstOrDefaultAsync(cm => cm.Id == comiteMembreId);

                        if (comiteMembre == null)
                        {
                            return StatusCode(500, "Erreur lors du rechargement des données");
                        }

                        var response = new ComiteMembreDetailDto
                        {
                            Id = comiteMembre.Id,
                            MembreId = comiteMembre.MembreId,
                            NomCompletMembre = $"{comiteMembre.Membre.FirstName} {comiteMembre.Membre.LastName}",
                            EmailMembre = comiteMembre.Membre.Email,
                            DepartmentMembre = comiteMembre.Membre.Department,
                            IsActiveMembre = comiteMembre.Membre.IsActive,
                            FonctionId = comiteMembre.FonctionId,
                            NomFonction = comiteMembre.Fonction.NomFonction
                        };

                        _logger.LogInformation(
                            "Fonction du membre {MembreId} modifiée de {AncienneFonction} à {NouvelleFonction} dans le comité {ComiteId}",
                            comiteMembre.MembreId,
                            ancienneFonction,
                            comiteMembre.Fonction.NomFonction,
                            comiteId
                        );

                        return Ok(response);
                    }
                    else
                    {
                        // Si la fonction n'a pas changé, retourner quand même les données actuelles
                        var response = new ComiteMembreDetailDto
                        {
                            Id = comiteMembre.Id,
                            MembreId = comiteMembre.MembreId,
                            NomCompletMembre = $"{comiteMembre.Membre.FirstName} {comiteMembre.Membre.LastName}",
                            EmailMembre = comiteMembre.Membre.Email,
                            DepartmentMembre = comiteMembre.Membre.Department,
                            IsActiveMembre = comiteMembre.Membre.IsActive,
                            FonctionId = comiteMembre.FonctionId,
                            NomFonction = comiteMembre.Fonction.NomFonction
                        };

                        return Ok(response);
                    }
                }

                // Si aucune fonction n'a été spécifiée, retourner les données actuelles
                var currentResponse = new ComiteMembreDetailDto
                {
                    Id = comiteMembre.Id,
                    MembreId = comiteMembre.MembreId,
                    NomCompletMembre = $"{comiteMembre.Membre.FirstName} {comiteMembre.Membre.LastName}",
                    EmailMembre = comiteMembre.Membre.Email,
                    DepartmentMembre = comiteMembre.Membre.Department,
                    IsActiveMembre = comiteMembre.Membre.IsActive,
                    FonctionId = comiteMembre.FonctionId,
                    NomFonction = comiteMembre.Fonction.NomFonction
                };

                return Ok(currentResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la modification de l'affectation {ComiteMembreId}", comiteMembreId);
                return StatusCode(500, "Une erreur est survenue lors de la modification");
            }
        }
    }
} 