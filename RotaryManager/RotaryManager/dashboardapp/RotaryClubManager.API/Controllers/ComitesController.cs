using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RotaryClubManager.Domain.Entities;
using RotaryClubManager.Infrastructure.Data;
using System.ComponentModel.DataAnnotations;

namespace RotaryClubManager.API.Controllers
{
    [Route("api/comites")]
    [ApiController]
    [Authorize]
    public class ComitesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ComitesController> _logger;

        public ComitesController(
            ApplicationDbContext context,
            ILogger<ComitesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/comites
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ComiteDto>>> GetComites([FromQuery] string? search = null)
        {
            try
            {
                var query = _context.Comites.AsQueryable();

                // Filtrer par terme de recherche si fourni
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(c => c.NomComite.ToLower().Contains(search.ToLower()) ||
                                           c.Description.ToLower().Contains(search.ToLower()));
                }

                var comites = await query
                    .OrderBy(c => c.NomComite)
                    .Select(c => new ComiteDto
                    {
                        Id = c.Id,
                        NomComite = c.NomComite,
                        Description = c.Description
                    })
                    .ToListAsync();

                return Ok(comites);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des comités");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des comités");
            }
        }

        // GET: api/comites/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ComiteDto>> GetComite(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return BadRequest("L'identifiant du comité est invalide");
                }

                var comite = await _context.Comites
                    .Where(c => c.Id == id)
                    .Select(c => new ComiteDto
                    {
                        Id = c.Id,
                        NomComite = c.NomComite,
                        Description = c.Description
                    })
                    .FirstOrDefaultAsync();

                if (comite == null)
                {
                    return NotFound($"Comité avec l'ID {id} non trouvé");
                }

                return Ok(comite);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du comité {ComiteId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du comité");
            }
        }

        // POST: api/comites
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ComiteDto>> PostComite([FromBody] CreateComiteRequest request)
        {
            try
            {
                // Vérifier l'unicité du nom
                var existingComite = await _context.Comites
                    .AnyAsync(c => c.NomComite.ToLower() == request.NomComite.ToLower());

                if (existingComite)
                {
                    return BadRequest($"Un comité avec le nom '{request.NomComite}' existe déjà");
                }

                // Créer le comité
                var comite = new Comite
                {
                    Id = Guid.NewGuid(),
                    NomComite = request.NomComite,
                    Description = request.Description
                };

                _context.Comites.Add(comite);
                await _context.SaveChangesAsync();

                var comiteDto = new ComiteDto
                {
                    Id = comite.Id,
                    NomComite = comite.NomComite,
                    Description = comite.Description
                };

                _logger.LogInformation("Comité {ComiteNom} créé avec l'ID {ComiteId}",
                    request.NomComite, comite.Id);

                return CreatedAtAction(
                    nameof(GetComite),
                    new { id = comite.Id },
                    comiteDto
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du comité {ComiteNom}", request.NomComite);
                return StatusCode(500, "Une erreur est survenue lors de la création du comité");
            }
        }

        // PUT: api/comites/{id}
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutComite(Guid id, [FromBody] UpdateComiteRequest request)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return BadRequest("L'identifiant du comité est invalide");
                }

                var comite = await _context.Comites.FindAsync(id);

                if (comite == null)
                {
                    return NotFound($"Comité avec l'ID {id} non trouvé");
                }

                // Vérifier l'unicité du nom si modifié
                if (!string.IsNullOrEmpty(request.NomComite) &&
                    request.NomComite.ToLower() != comite.NomComite.ToLower())
                {
                    var existingComite = await _context.Comites
                        .AnyAsync(c => c.NomComite.ToLower() == request.NomComite.ToLower() && c.Id != id);

                    if (existingComite)
                    {
                        return BadRequest($"Un comité avec le nom '{request.NomComite}' existe déjà");
                    }
                }

                // Mettre à jour les propriétés
                if (!string.IsNullOrEmpty(request.NomComite))
                    comite.NomComite = request.NomComite;
                if (request.Description != null)
                    comite.Description = request.Description;

                _context.Entry(comite).State = EntityState.Modified;

                try
                {
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Comité {ComiteId} mis à jour avec succès", id);
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!await ComiteExists(id))
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du comité {ComiteId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du comité");
            }
        }

        // DELETE: api/comites/{id}
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteComite(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return BadRequest("L'identifiant du comité est invalide");
                }

                var comite = await _context.Comites.FindAsync(id);

                if (comite == null)
                {
                    return NotFound($"Comité avec l'ID {id} non trouvé");
                }

                // Vérifier s'il y a des dépendances avant suppression
                // Cette vérification dépend de votre modèle de données
                // Exemple : var hasDependencies = await _context.Membres.AnyAsync(m => m.ComiteId == id);
                // if (hasDependencies)
                // {
                //     return BadRequest("Impossible de supprimer ce comité car il est utilisé par des membres");
                // }

                _context.Comites.Remove(comite);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Comité {ComiteId} supprimé", id);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du comité {ComiteId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du comité");
            }
        }

        // GET: api/comites/search
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ComiteDto>>> SearchComites([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrEmpty(searchTerm))
                {
                    return BadRequest("Le terme de recherche est requis");
                }

                if (searchTerm.Length < 2)
                {
                    return BadRequest("Le terme de recherche doit contenir au moins 2 caractères");
                }

                var comites = await _context.Comites
                    .Where(c => c.NomComite.ToLower().Contains(searchTerm.ToLower()) ||
                               c.Description.ToLower().Contains(searchTerm.ToLower()))
                    .OrderBy(c => c.NomComite)
                    .Select(c => new ComiteDto
                    {
                        Id = c.Id,
                        NomComite = c.NomComite,
                        Description = c.Description
                    })
                    .ToListAsync();

                return Ok(comites);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche de comités avec le terme {SearchTerm}", searchTerm);
                return StatusCode(500, "Une erreur est survenue lors de la recherche");
            }
        }

        // Méthodes d'aide
        private async Task<bool> ComiteExists(Guid id)
        {
            return await _context.Comites.AnyAsync(e => e.Id == id);
        }
    }

    // DTOs
    public class ComiteDto
    {
        public Guid Id { get; set; }
        public string NomComite { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class CreateComiteRequest
    {
        [Required]
        [MaxLength(100)]
        public string NomComite { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class UpdateComiteRequest
    {
        [MaxLength(100)]
        public string? NomComite { get; set; }
        public string? Description { get; set; }
    }
} 