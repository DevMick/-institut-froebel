using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RotaryClubManager.Domain.Entities;
using RotaryClubManager.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RotaryClubManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MembresComiteController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MembresComiteController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/MembresComite
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MembreComiteDto>>> GetMembresComite()
        {
            var membresComite = await _context.MembresComite
                .Include(mc => mc.Membre)
                .Include(mc => mc.Comite)
                .Include(mc => mc.Mandat)
                .Select(mc => new MembreComiteDto
                {
                    Id = mc.Id,
                    MembreId = mc.MembreId,
                    NomMembre = mc.Membre.Nom + " " + mc.Membre.Prenom,
                    ComiteId = mc.ComiteId,
                    NomComite = mc.Comite.NomComite,
                    MandatId = mc.MandatId,
                    AnneeMandat = mc.Mandat.Annee,
                    EstResponsable = mc.EstResponsable,
                    EstActif = mc.EstActif,
                    DateNomination = mc.DateNomination,
                    DateDemission = mc.DateDemission,
                    Commentaires = mc.Commentaires
                })
                .ToListAsync();

            return membresComite;
        }

        // GET: api/MembresComite/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MembreComiteDto>> GetMembreComite(Guid id)
        {
            var membreComite = await _context.MembresComite
                .Include(mc => mc.Membre)
                .Include(mc => mc.Comite)
                .Include(mc => mc.Mandat)
                .FirstOrDefaultAsync(mc => mc.Id == id);

            if (membreComite == null)
            {
                return NotFound();
            }

            return new MembreComiteDto
            {
                Id = membreComite.Id,
                MembreId = membreComite.MembreId,
                NomMembre = membreComite.Membre.Nom + " " + membreComite.Membre.Prenom,
                ComiteId = membreComite.ComiteId,
                NomComite = membreComite.Comite.NomComite,
                MandatId = membreComite.MandatId,
                AnneeMandat = membreComite.Mandat.Annee,
                EstResponsable = membreComite.EstResponsable,
                EstActif = membreComite.EstActif,
                DateNomination = membreComite.DateNomination,
                DateDemission = membreComite.DateDemission,
                Commentaires = membreComite.Commentaires
            };
        }

        // POST: api/MembresComite
        [HttpPost]
        public async Task<ActionResult<MembreComiteDto>> PostMembreComite(MembreComiteCreateDto dto)
        {
            var membreComite = new MembreComite
            {
                MembreId = dto.MembreId,
                ComiteId = dto.ComiteId,
                MandatId = dto.MandatId,
                EstResponsable = dto.EstResponsable,
                EstActif = true,
                DateNomination = DateTime.UtcNow,
                Commentaires = dto.Commentaires
            };

            _context.MembresComite.Add(membreComite);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMembreComite), new { id = membreComite.Id }, dto);
        }

        // PUT: api/MembresComite/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMembreComite(Guid id, MembreComiteUpdateDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest();
            }

            var membreComite = await _context.MembresComite.FindAsync(id);
            if (membreComite == null)
            {
                return NotFound();
            }

            membreComite.EstResponsable = dto.EstResponsable;
            membreComite.EstActif = dto.EstActif;
            membreComite.DateDemission = dto.DateDemission;
            membreComite.Commentaires = dto.Commentaires;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MembreComiteExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/MembresComite/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMembreComite(Guid id)
        {
            var membreComite = await _context.MembresComite.FindAsync(id);
            if (membreComite == null)
            {
                return NotFound();
            }

            _context.MembresComite.Remove(membreComite);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MembreComiteExists(Guid id)
        {
            return _context.MembresComite.Any(e => e.Id == id);
        }
    }

    public class MembreComiteDto
    {
        public Guid Id { get; set; }
        public Guid MembreId { get; set; }
        public string NomMembre { get; set; }
        public Guid ComiteId { get; set; }
        public string NomComite { get; set; }
        public Guid MandatId { get; set; }
        public int AnneeMandat { get; set; }
        public bool EstResponsable { get; set; }
        public bool EstActif { get; set; }
        public DateTime DateNomination { get; set; }
        public DateTime? DateDemission { get; set; }
        public string? Commentaires { get; set; }
    }

    public class MembreComiteCreateDto
    {
        public Guid MembreId { get; set; }
        public Guid ComiteId { get; set; }
        public Guid MandatId { get; set; }
        public bool EstResponsable { get; set; }
        public string? Commentaires { get; set; }
    }

    public class MembreComiteUpdateDto
    {
        public Guid Id { get; set; }
        public bool EstResponsable { get; set; }
        public bool EstActif { get; set; }
        public DateTime? DateDemission { get; set; }
        public string? Commentaires { get; set; }
    }
} 