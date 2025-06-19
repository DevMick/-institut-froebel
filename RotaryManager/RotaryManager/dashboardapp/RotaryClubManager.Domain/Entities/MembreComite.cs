using System.ComponentModel.DataAnnotations;

namespace RotaryClubManager.Domain.Entities
{
    public class MembreComite
    {
        public Guid Id { get; set; }

        public Guid MembreId { get; set; }
        public virtual Membre Membre { get; set; } = null!;

        public Guid ComiteId { get; set; }
        public virtual Comite Comite { get; set; } = null!;

        public Guid MandatId { get; set; }
        public virtual Mandat Mandat { get; set; } = null!;

        public bool EstResponsable { get; set; }

        public bool EstActif { get; set; } = true;

        public DateTime DateNomination { get; set; }

        public DateTime? DateDemission { get; set; }

        public string? Commentaires { get; set; }
    }
} 