using System.Net.Mail;
using System.Net;
using RotaryClubMobile.API.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace RotaryClubMobile.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            
            // Configuration SMTP depuis appsettings.json
            _smtpServer = _configuration["Email:SmtpServer"] ?? "smtp.gmail.com";
            _smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            _smtpUsername = _configuration["Email:Username"] ?? "";
            _smtpPassword = _configuration["Email:Password"] ?? "";
            _fromEmail = _configuration["Email:FromEmail"] ?? "noreply@rotaryclub.com";
            _fromName = _configuration["Email:FromName"] ?? "Rotary Club Mobile";
        }

        public async Task<EmailResponse> SendClubEmailAsync(EmailRequest request, string clubId)
        {
            var response = new EmailResponse();
            var failedRecipients = new List<string>();

            try
            {
                _logger.LogInformation($"Envoi d'email pour le club {clubId} à {request.Recipients.Count} destinataires");

                // Validation des données
                if (request.Recipients == null || !request.Recipients.Any())
                {
                    response.Success = false;
                    response.Message = "Aucun destinataire spécifié";
                    return response;
                }

                // Envoi en lot
                var tasks = request.Recipients.Select(async recipient =>
                {
                    try
                    {
                        var success = await SendEmailAsync(
                            recipient,
                            request.Subject,
                            request.Message,
                            request.SenderName ?? _fromName,
                            request.SenderEmail ?? _fromEmail
                        );

                        if (!success)
                        {
                            failedRecipients.Add(recipient);
                        }

                        return success;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Erreur lors de l'envoi à {recipient}");
                        failedRecipients.Add(recipient);
                        return false;
                    }
                });

                var results = await Task.WhenAll(tasks);
                var successCount = results.Count(r => r);

                response.Success = successCount > 0;
                response.SentCount = successCount;
                response.FailedRecipients = failedRecipients;
                response.Message = $"Email envoyé à {successCount} sur {request.Recipients.Count} destinataires";

                _logger.LogInformation($"Email envoyé avec succès: {successCount}/{request.Recipients.Count}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'envoi d'email en lot");
                response.Success = false;
                response.Message = "Erreur lors de l'envoi d'email";
                response.FailedRecipients = request.Recipients;
            }

            return response;
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string message, string? fromName = null, string? fromEmail = null)
        {
            try
            {
                using var client = new SmtpClient(_smtpServer, _smtpPort)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(_smtpUsername, _smtpPassword)
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail ?? _fromEmail, fromName ?? _fromName),
                    Subject = subject,
                    Body = message,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(to);

                await client.SendMailAsync(mailMessage);
                
                _logger.LogInformation($"Email envoyé avec succès à {to}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erreur lors de l'envoi d'email à {to}");
                return false;
            }
        }

        public async Task<bool> SendBulkEmailAsync(List<string> recipients, string subject, string message, string? fromName = null, string? fromEmail = null)
        {
            try
            {
                using var client = new SmtpClient(_smtpServer, _smtpPort)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(_smtpUsername, _smtpPassword)
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail ?? _fromEmail, fromName ?? _fromName),
                    Subject = subject,
                    Body = message,
                    IsBodyHtml = true
                };

                foreach (var recipient in recipients)
                {
                    mailMessage.To.Add(recipient);
                }

                await client.SendMailAsync(mailMessage);
                
                _logger.LogInformation($"Email en lot envoyé avec succès à {recipients.Count} destinataires");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'envoi d'email en lot");
                return false;
            }
        }
    }
}
