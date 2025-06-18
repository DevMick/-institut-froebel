using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Pages.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class RubriqueBudgetRealiseController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RubriqueBudgetRealiseController> _logger;

        public RubriqueBudgetRealiseController(ApplicationDbContext context, ILogger<RubriqueBudgetRealiseController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("statistiques")]
        public async Task<ActionResult<RubriqueBudgetRealiseStatistiquesDto>> GetStatistiques(
            Guid clubId,
            Guid rubriqueId,
            [FromQuery] int? annee = null)
        {
            try
            {
                // Validation des paramètres
                if (clubId == Guid.Empty)
                {
                    return BadRequest("L'identifiant du club est invalide");
                }

                if (rubriqueId == Guid.Empty)
                {
                    return BadRequest("L'identifiant de la rubrique est invalide");
                }

                // Vérifier les autorisations
                if (!await CanAccessClub(clubId))
                {
                    return Forbid("Accès non autorisé à ce club");
                }

                // Vérifier que la rubrique existe
                var rubrique = await _context.RubriquesBudget
                    .Include(r => r.Mandat)
                    .FirstOrDefaultAsync(r => r.Id == rubriqueId && r.ClubId == clubId);

                if (rubrique == null)
                {
                    return NotFound($"Rubrique avec l'ID {rubriqueId} non trouvée pour le club {clubId}");
                }

                var query = _context.RubriquesBudgetRealisees
                    .Where(r => r.RubriqueBudgetId == rubriqueId);

                // Filtre optionnel par année
                if (annee.HasValue)
                {
                    query = query.Where(r => r.Date.Year == annee.Value);
                }

                var realisations = await query.ToListAsync();

                // Calculs sécurisés avec vérifications nulles
                var montantTotalRealise = realisations.Sum(r => r.Montant);
                var nombreTotalRealisations = realisations.Count;
                var montantMoyenRealisation = nombreTotalRealisations > 0 ? realisations.Average(r => r.Montant) : 0;
                var ecartBudgetRealise = montantTotalRealise - rubrique.MontantTotal;

                // Calcul sécurisé du pourcentage
                double pourcentageRealisation = 0;
                if (rubrique.MontantTotal > 0)
                {
                    pourcentageRealisation = Math.Round((double)(montantTotalRealise / rubrique.MontantTotal) * 100, 2);
                }

                // Statistiques par mois avec calculs sécurisés
                var statistiquesParMois = realisations
                    .GroupBy(r => new { r.Date.Year, r.Date.Month })
                    .Select(g => {
                        var montants = g.Select(r => r.Montant).ToList();
                        return new RubriqueBudgetRealiseStatistiqueMensuelleDto
                        {
                            Annee = g.Key.Year,
                            Mois = g.Key.Month,
                            NombreRealisations = g.Count(),
                            MontantTotal = montants.Sum(),
                            MontantMoyen = montants.Any() ? montants.Average() : 0,
                            MontantMin = montants.Any() ? montants.Min() : 0,
                            MontantMax = montants.Any() ? montants.Max() : 0
                        };
                    })
                    .OrderBy(s => s.Annee)
                    .ThenBy(s => s.Mois)
                    .ToList();

                var result = new RubriqueBudgetRealiseStatistiquesDto
                {
                    ClubId = clubId,
                    RubriqueBudgetId = rubriqueId,
                    MontantBudgete = rubrique.MontantTotal,
                    NombreTotalRealisations = nombreTotalRealisations,
                    MontantTotalRealise = montantTotalRealise,
                    MontantMoyenRealisation = montantMoyenRealisation,
                    EcartBudgetRealise = ecartBudgetRealise,
                    PourcentageRealisation = pourcentageRealisation,
                    StatistiquesParMois = statistiquesParMois
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statistiques de la rubrique {RubriqueId} du club {ClubId}", rubriqueId, clubId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des statistiques");
            }
        }
    }
} 