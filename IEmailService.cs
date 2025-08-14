using RotaryClubMobile.API.Models;

namespace RotaryClubMobile.API.Services
{
    public interface IEmailService
    {
        Task<EmailResponse> SendClubEmailAsync(EmailRequest request, string clubId);
        Task<bool> SendEmailAsync(string to, string subject, string message, string? fromName = null, string? fromEmail = null);
        Task<bool> SendBulkEmailAsync(List<string> recipients, string subject, string message, string? fromName = null, string? fromEmail = null);
    }
}
