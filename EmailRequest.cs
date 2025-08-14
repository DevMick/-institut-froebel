using System.ComponentModel.DataAnnotations;

namespace RotaryClubMobile.API.Models
{
    public class EmailRequest
    {
        [Required]
        [StringLength(100)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Message { get; set; } = string.Empty;

        [Required]
        public List<string> Recipients { get; set; } = new List<string>();

        public List<string>? Attachments { get; set; }

        public string? SenderName { get; set; }
        
        public string? SenderEmail { get; set; }
    }

    public class EmailResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int SentCount { get; set; }
        public List<string> FailedRecipients { get; set; } = new List<string>();
    }
}
