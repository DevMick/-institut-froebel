using System.ComponentModel.DataAnnotations;

namespace RotaryClubManager.Domain.Entities
{
    public class Comite
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string NomComite { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Navigation properties
        public virtual ICollection<MembreComite> MembresComite { get; set; } = new List<MembreComite>();
    }
} 