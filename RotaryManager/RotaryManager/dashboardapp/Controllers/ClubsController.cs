using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClubsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ClubsController> _logger;

        public ClubsController(ApplicationDbContext context, ILogger<ClubsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Supprimer un club (seulement pour les administrateurs)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteClub(Guid id)
        {
            try
            {
                // Vérifier si le club existe
                var club = await _context.Clubs
                    .Include(c => c.Users)
                    .Include(c => c.CommissionsClub)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (club == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = "Club non trouvé."
                    });
                }

                // Vérifier si le club est actif
                if (club.IsActive)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Impossible de supprimer un club actif. Veuillez d'abord le désactiver."
                    });
                }

                // Vérifier si des utilisateurs sont liés à ce club
                if (club.Users.Any())
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Impossible de supprimer un club qui a des membres. Veuillez d'abord désaffecter tous les membres.",
                        MemberCount = club.Users.Count
                    });
                }

                // Vérifier si des commissions sont liées à ce club
                if (club.CommissionsClub.Any())
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Impossible de supprimer un club qui a des commissions. Veuillez d'abord supprimer toutes les commissions.",
                        CommissionCount = club.CommissionsClub.Count
                    });
                }

                // Vérifier si le club a des mandats
                var hasMandats = await _context.Mandats.AnyAsync(m => m.ClubId == id);
                if (hasMandats)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Impossible de supprimer un club qui a des mandats. Veuillez d'abord supprimer tous les mandats."
                    });
                }

                // Supprimer le club
                _context.Clubs.Remove(club);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Club {ClubId} ({ClubName}) supprimé avec succès par l'utilisateur {UserId}",
                    id, club.Name, User.FindFirstValue(ClaimTypes.NameIdentifier));

                return Ok(new
                {
                    Success = true,
                    Message = "Club supprimé avec succès.",
                    ClubId = id,
                    ClubName = club.Name
                });
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Erreur de base de données lors de la suppression du club {ClubId}", id);
                return BadRequest(new
                {
                    Success = false,
                    Message = "Erreur lors de la suppression en base de données.",
                    DetailedError = dbEx.InnerException?.Message ?? dbEx.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du club {ClubId}", id);
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Une erreur inattendue s'est produite lors de la suppression du club.",
                    DetailedError = ex.Message
                });
            }
        }
    }
} 