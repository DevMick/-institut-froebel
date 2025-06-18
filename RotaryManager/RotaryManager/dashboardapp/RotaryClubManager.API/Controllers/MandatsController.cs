using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RotaryClubManager.Infrastructure.Data;
using RotaryClubManager.Domain.Entities;

namespace RotaryClubManager.API.Controllers
{
    [Route("api/clubs/{clubId}/mandats")]
    [ApiController]
    [Authorize]
    public class MandatsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<MandatsController> _logger;

        public MandatsController(
            ApplicationDbContext context,
            ILogger<MandatsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/clubs/{clubId}/mandats
        [HttpGet]
        public async Task<IActionResult> GetMandats(Guid clubId)
        {
            try
            {
                if (clubId == Guid.Empty)
                {
                    return BadRequest("L'identifiant du club est invalide");
                }

                var mandats = await _context.Mandats
                    .Where(m => m.ClubId == clubId)
                    .OrderByDescending(m => m.Annee)
                    .Select(m => new
                    {
                        Id = m.Id,
                        Annee = m.Annee,
                        Description = m.Description,
                        EstActuel = m.EstActuel
                    })
                    .ToListAsync();

                return Ok(mandats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des mandats pour le club {ClubId}", clubId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des mandats");
            }
        }

        // GET: api/clubs/{clubId}/mandats/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetMandat(Guid clubId, Guid id)
        {
            try
            {
                if (clubId == Guid.Empty)
                {
                    return BadRequest("L'identifiant du club est invalide");
                }

                var mandat = await _context.Mandats
                    .Where(m => m.ClubId == clubId && m.Id == id)
                    .Select(m => new
                    {
                        Id = m.Id,
                        Annee = m.Annee,
                        Description = m.Description,
                        EstActuel = m.EstActuel
                    })
                    .FirstOrDefaultAsync();

                if (mandat == null)
                {
                    return NotFound($"Mandat avec l'ID {id} non trouvé dans le club {clubId}");
                }

                return Ok(mandat);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du mandat {MandatId} pour le club {ClubId}", id, clubId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du mandat");
            }
        }

        // GET: api/clubs/{clubId}/mandats/actuel
        [HttpGet("actuel")]
        public async Task<IActionResult> GetMandatActuel(Guid clubId)
        {
            try
            {
                if (clubId == Guid.Empty)
                {
                    return BadRequest("L'identifiant du club est invalide");
                }

                var mandat = await _context.Mandats
                    .Where(m => m.ClubId == clubId && m.EstActuel)
                    .Select(m => new
                    {
                        Id = m.Id,
                        Annee = m.Annee,
                        Description = m.Description,
                        EstActuel = m.EstActuel
                    })
                    .FirstOrDefaultAsync();

                if (mandat == null)
                {
                    return NotFound($"Aucun mandat actuel trouvé pour le club {clubId}");
                }

                return Ok(mandat);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du mandat actuel pour le club {ClubId}", clubId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du mandat actuel");
            }
        }
    }
} 