using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using RotaryClubManager.Domain.Entities;
using RotaryClubManager.Infrastructure.Data;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace RotaryClubManager.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/clubs/{clubId}/mandats/{mandatId}/rubriques")]
    public class RubriqueBudgetController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RubriqueBudgetController> _logger;

        public RubriqueBudgetController(ApplicationDbContext context, ILogger<RubriqueBudgetController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/clubs/{clubId}/mandats/{mandatId}/rubriques/statistiques
        [HttpGet("statistiques")]
        public async Task<ActionResult<RubriqueBudgetStatistiquesDto>> GetStatistiques(
            Guid clubId,
            Guid mandatId)
        {
            try
            {
                // Validation des paramètres
                if (clubId == Guid.Empty)
                {
                    return BadRequest("L'identifiant du club est invalide");
                }

                if (mandatId == Guid.Empty)
                {
                    return BadRequest("L'identifiant du mandat est invalide");
                }

                // Vérifier les autorisations
                if (!await CanAccessClub(clubId))
                {
                    return Forbid("Accès non autorisé à ce club");
                }

                // Vérifier que le mandat existe et appartient au club
                var mandat = await _context.Mandats
                    .FirstOrDefaultAsync(m => m.Id == mandatId && m.ClubId == clubId);

                if (mandat == null)
                {
                    return NotFound($"Mandat avec l'ID {mandatId} non trouvé pour le club {clubId}");
                }

                // Récupérer les rubriques avec les réalisations
                var rubriques = await _context.RubriquesBudget
                    .Include(r => r.SousCategoryBudget)
                        .ThenInclude(sc => sc.CategoryBudget)
                            .ThenInclude(c => c.TypeBudget)
                    .Include(r => r.RubriquesBudgetRealisees)
                    .Where(r => r.ClubId == clubId && r.MandatId == mandatId)
                    .ToListAsync();

                // Calculer les statistiques par type de budget
                var statistiquesParType = rubriques
                    .GroupBy(r => r.SousCategoryBudget.CategoryBudget.TypeBudget.Libelle)
                    .Select(g => new RubriqueBudgetStatistiqueParTypeDto
                    {
                        TypeBudgetLibelle = g.Key,
                        NombreRubriques = g.Count(),
                        MontantTotalBudget = g.Sum(r => r.MontantTotal),
                        MontantTotalRealise = g.Sum(r => r.RubriquesBudgetRealisees.Sum(rb => rb.Montant)),
                        EcartBudgetRealise = g.Sum(r => r.RubriquesBudgetRealisees.Sum(rb => rb.Montant)) - g.Sum(r => r.MontantTotal)
                    })
                    .OrderBy(s => s.TypeBudgetLibelle)
                    .ToList();

                // Calculer les totaux
                var montantTotalBudget = rubriques.Sum(r => r.MontantTotal);
                var montantTotalRealise = rubriques.Sum(r => r.RubriquesBudgetRealisees.Sum(rb => rb.Montant));

                var result = new RubriqueBudgetStatistiquesDto
                {
                    ClubId = clubId,
                    MandatId = mandatId,
                    NombreTotalRubriques = rubriques.Count,
                    MontantTotalBudget = montantTotalBudget,
                    MontantTotalRealise = montantTotalRealise,
                    EcartTotalBudgetRealise = montantTotalRealise - montantTotalBudget,
                    StatistiquesParType = statistiquesParType
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statistiques des rubriques du club {ClubId} pour le mandat {MandatId}", clubId, mandatId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des statistiques");
            }
        }

        // Méthodes d'aide
        private async Task<bool> CanAccessClub(Guid clubId)
        {
            if (User.IsInRole("Admin"))
                return true;

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return false;

            var hasAccess = await _context.UserClubs
                .AnyAsync(uc => uc.UserId == userId && uc.ClubId == clubId);

            return hasAccess;
        }
    }

    // DTOs pour les statistiques de budget
    public class RubriqueBudgetStatistiquesDto
    {
        public Guid ClubId { get; set; }
        public Guid MandatId { get; set; }
        public int NombreTotalRubriques { get; set; }
        public decimal MontantTotalBudget { get; set; }
        public decimal MontantTotalRealise { get; set; }
        public decimal EcartTotalBudgetRealise { get; set; }
        public List<RubriqueBudgetStatistiqueParTypeDto> StatistiquesParType { get; set; } = new List<RubriqueBudgetStatistiqueParTypeDto>();
    }

    public class RubriqueBudgetStatistiqueParTypeDto
    {
        public string TypeBudgetLibelle { get; set; } = string.Empty;
        public int NombreRubriques { get; set; }
        public decimal MontantTotalBudget { get; set; }
        public decimal MontantTotalRealise { get; set; }
        public decimal EcartBudgetRealise { get; set; }
    }
} 