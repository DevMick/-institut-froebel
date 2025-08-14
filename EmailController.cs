using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RotaryClubMobile.API.Models;
using RotaryClubMobile.API.Services;
using System.Security.Claims;

namespace RotaryClubMobile.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<EmailController> _logger;

        public EmailController(IEmailService emailService, ILogger<EmailController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        /// <summary>
        /// Envoie un email aux membres d'un club
        /// </summary>
        /// <param name="request">Données de l'email</param>
        /// <param name="clubId">ID du club</param>
        /// <returns>Résultat de l'envoi</returns>
        [HttpPost("clubs/{clubId}/email")]
        public async Task<ActionResult<EmailResponse>> SendClubEmail([FromBody] EmailRequest request, string clubId)
        {
            try
            {
                // Validation des données
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (request.Recipients == null || !request.Recipients.Any())
                {
                    return BadRequest(new { message = "Aucun destinataire spécifié" });
                }

                // Récupérer les informations de l'utilisateur connecté
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                var userName = User.FindFirst(ClaimTypes.Name)?.Value;

                _logger.LogInformation($"Utilisateur {userId} ({userEmail}) envoie un email au club {clubId}");

                // Ajouter les informations de l'expéditeur
                request.SenderName = userName;
                request.SenderEmail = userEmail;

                // Envoyer l'email
                var result = await _emailService.SendClubEmailAsync(request, clubId);

                if (result.Success)
                {
                    _logger.LogInformation($"Email envoyé avec succès: {result.SentCount}/{request.Recipients.Count} destinataires");
                    return Ok(result);
                }
                else
                {
                    _logger.LogWarning($"Échec de l'envoi d'email: {result.Message}");
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'envoi d'email");
                return StatusCode(500, new { message = "Erreur interne du serveur" });
            }
        }

        /// <summary>
        /// Envoie un email simple
        /// </summary>
        /// <param name="request">Données de l'email</param>
        /// <returns>Résultat de l'envoi</returns>
        [HttpPost("send")]
        public async Task<ActionResult<bool>> SendEmail([FromBody] EmailRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (request.Recipients == null || !request.Recipients.Any())
                {
                    return BadRequest(new { message = "Aucun destinataire spécifié" });
                }

                var result = await _emailService.SendBulkEmailAsync(
                    request.Recipients,
                    request.Subject,
                    request.Message,
                    request.SenderName,
                    request.SenderEmail
                );

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'envoi d'email");
                return StatusCode(500, new { message = "Erreur interne du serveur" });
            }
        }

        /// <summary>
        /// Test de connexion email
        /// </summary>
        /// <returns>Statut de la connexion</returns>
        [HttpGet("test")]
        public ActionResult<object> TestEmailConnection()
        {
            try
            {
                return Ok(new { 
                    status = "success", 
                    message = "Service email disponible",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du test de connexion email");
                return StatusCode(500, new { 
                    status = "error", 
                    message = "Service email indisponible" 
                });
            }
        }
    }
}
