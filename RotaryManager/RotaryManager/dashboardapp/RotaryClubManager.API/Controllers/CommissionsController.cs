using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RotaryClubManager.Infrastructure.Data;
using RotaryClubManager.Domain.Entities;

namespace RotaryClubManager.API.Controllers
{
    [Route("api/clubs/{clubId}/commissions")]
    [ApiController]
    [Authorize]
    public class CommissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CommissionsController> _logger;

        public CommissionsController(
            ApplicationDbContext context,
            ILogger<CommissionsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/clubs/{clubId}/commissions
        [HttpGet]
        public async Task<IActionResult> GetCommissions(Guid clubId)
        {
            try
            {
                if (clubId == Guid.Empty)
                {
                    return BadRequest("L'identifiant du club est invalide");
                }

                var commissions = await _context.CommissionsClub
                    .Include(cc => cc.Commission)
                    .Where(cc => cc.ClubId == clubId && cc.EstActive)
                    .OrderBy(cc => cc.Commission.Nom)
                    .Select(cc => new
                    {
                        Id = cc.Id,
                        Nom = cc.Commission.Nom,
                        Description = cc.Commission.Description,
                        EstActive = cc.EstActive,
                        NotesSpecifiques = cc.NotesSpecifiques
                    })
                    .ToListAsync();

                return Ok(commissions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des commissions pour le club {ClubId}", clubId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des commissions");
            }
        }

        // GET: api/clubs/{clubId}/commissions/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetCommission(Guid clubId, Guid id)
        {
            try
            {
                if (clubId == Guid.Empty)
                {
                    return BadRequest("L'identifiant du club est invalide");
                }

                var commission = await _context.CommissionsClub
                    .Include(cc => cc.Commission)
                    .Where(cc => cc.ClubId == clubId && cc.Id == id)
                    .Select(cc => new
                    {
                        Id = cc.Id,
                        Nom = cc.Commission.Nom,
                        Description = cc.Commission.Description,
                        EstActive = cc.EstActive,
                        NotesSpecifiques = cc.NotesSpecifiques
                    })
                    .FirstOrDefaultAsync();

                if (commission == null)
                {
                    return NotFound($"Commission avec l'ID {id} non trouvée dans le club {clubId}");
                }

                return Ok(commission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la commission {CommissionId} pour le club {ClubId}", id, clubId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de la commission");
            }
        }
    }
} 