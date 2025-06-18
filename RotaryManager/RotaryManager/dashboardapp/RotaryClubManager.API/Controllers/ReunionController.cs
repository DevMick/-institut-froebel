using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Word = Microsoft.Office.Interop.Word;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using DocumentFormat.OpenXml;

namespace RotaryClubManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReunionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ITenantService _tenantService;
        private readonly ILogger<ReunionController> _logger;

        public ReunionController(ApplicationDbContext context, ITenantService tenantService, ILogger<ReunionController> logger)
        {
            _context = context;
            _tenantService = tenantService;
            _logger = logger;
        }

        [HttpPost("{reunionId:guid}/compte-rendu")]
        [Authorize(Roles = "Admin,President,Secretary")]
        public async Task<IActionResult> GenererCompteRendu(Guid clubId, Guid reunionId, [FromBody] CompteRenduRequest request)
        {
            try
            {
                if (clubId == Guid.Empty)
                    return BadRequest("L'identifiant du club est invalide");

                if (reunionId == Guid.Empty)
                    return BadRequest("L'identifiant de la réunion est invalide");

                if (!await CanAccessClub(clubId))
                    return Forbid("Accès non autorisé à ce club");

                _tenantService.SetCurrentTenantId(clubId);

                // Vérifier que la réunion existe
                var reunion = await _context.Reunions
                    .Include(r => r.TypeReunion)
                    .Include(r => r.Club)
                    .FirstOrDefaultAsync(r => r.Id == reunionId && r.ClubId == clubId);

                if (reunion == null)
                    return NotFound($"Réunion avec l'ID {reunionId} non trouvée dans le club {clubId}");

                // Créer un nouveau document Word
                using (var memStream = new MemoryStream())
                {
                    using (var document = WordprocessingDocument.Create(memStream, WordprocessingDocumentType.Document))
                    {
                        var mainPart = document.AddMainDocumentPart();
                        mainPart.Document = new Document();
                        var body = mainPart.Document.AppendChild(new Body());

                        // En-tête avec nom du club
                        var clubHeader = body.AppendChild(new Paragraph(
                            new Run(new Text(reunion.Club.Name))
                        ));
                        ApplyParagraphStyle(clubHeader, "Heading3");

                        // Titre principal
                        var title = body.AppendChild(new Paragraph(
                            new Run(new Text("COMPTE-RENDU DE RÉUNION"))
                        ));
                        ApplyParagraphStyle(title, "Heading1");

                        // Sous-titre avec la date et le type de réunion
                        var subtitle = body.AppendChild(new Paragraph(
                            new Run(new Text($"{reunion.TypeReunion.Libelle} du {reunion.Date:dd/MM/yyyy} à {reunion.Heure:hh\\:mm}"))
                        ));
                        ApplyParagraphStyle(subtitle, "Heading2");

                        // Espacement
                        body.AppendChild(new Paragraph());

                        // Créer un tableau pour les présences et invités
                        var table = body.AppendChild(new Table());
                        var tableProperties = new TableProperties(
                            new TableBorders(
                                new TopBorder { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 4 },
                                new BottomBorder { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 4 },
                                new LeftBorder { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 4 },
                                new RightBorder { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 4 },
                                new InsideHorizontalBorder { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 4 },
                                new InsideVerticalBorder { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 4 }
                            )
                        );
                        table.AppendChild(tableProperties);

                        // Créer les colonnes du tableau
                        var tableGrid = new TableGrid(
                            new GridColumn { Width = "4000" },
                            new GridColumn { Width = "4000" }
                        );
                        table.AppendChild(tableGrid);

                        // En-tête du tableau
                        var headerRow = table.AppendChild(new TableRow());
                        var headerCell1 = headerRow.AppendChild(new TableCell());
                        var headerCell2 = headerRow.AppendChild(new TableCell());

                        headerCell1.AppendChild(new Paragraph(
                            new Run(new Text("LISTE DES PRÉSENCES"))
                        ));
                        headerCell2.AppendChild(new Paragraph(
                            new Run(new Text("LISTE DES INVITÉS"))
                        ));

                        // Remplir le tableau avec les présences et invités
                        var maxRows = Math.Max(
                            request.Presences?.Count ?? 0,
                            request.Invites?.Count ?? 0
                        );

                        for (int i = 0; i < maxRows; i++)
                        {
                            var row = table.AppendChild(new TableRow());
                            var cell1 = row.AppendChild(new TableCell());
                            var cell2 = row.AppendChild(new TableCell());

                            if (i < (request.Presences?.Count ?? 0))
                            {
                                cell1.AppendChild(new Paragraph(
                                    new Run(new Text($"• {request.Presences[i].NomComplet}"))
                                ));
                            }

                            if (i < (request.Invites?.Count ?? 0))
                            {
                                var invite = request.Invites[i];
                                var nomComplet = $"{invite.Prenom} {invite.Nom}";
                                if (!string.IsNullOrEmpty(invite.Organisation))
                                {
                                    nomComplet += $" ({invite.Organisation})";
                                }
                                cell2.AppendChild(new Paragraph(
                                    new Run(new Text($"• {nomComplet}"))
                                ));
                            }
                        }

                        // Espacement après le tableau
                        body.AppendChild(new Paragraph());

                        // Section Déroulé
                        var derouleTitle = body.AppendChild(new Paragraph(
                            new Run(new Text("DÉROULÉ"))
                        ));
                        ApplyParagraphStyle(derouleTitle, "Heading3");

                        // Section Ordre du jour
                        if (request.OrdresDuJour != null && request.OrdresDuJour.Any())
                        {
                            foreach (var ordre in request.OrdresDuJour)
                            {
                                // Titre de l'ordre du jour
                                var ordreTitle = body.AppendChild(new Paragraph(
                                    new Run(new Text($"{ordre.Numero}. {ordre.Description}"))
                                ));
                                ApplyParagraphStyle(ordreTitle, "Heading4");

                                // Contenu de l'ordre du jour
                                if (!string.IsNullOrEmpty(ordre.Contenu))
                                {
                                    var paragraphes = ordre.Contenu.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
                                    foreach (var paragraphe in paragraphes)
                                    {
                                        if (!string.IsNullOrWhiteSpace(paragraphe))
                                        {
                                            body.AppendChild(new Paragraph(
                                                new Run(new Text(paragraphe.Trim()))
                                            ));
                                        }
                                    }
                                }
                                else
                                {
                                    body.AppendChild(new Paragraph(
                                        new Run(new Text("(Point non traité ou sans détail)"))
                                    ));
                                }
                                body.AppendChild(new Paragraph()); // Espacement entre les ordres
                            }
                        }

                        // Section Divers
                        var diversTitle = body.AppendChild(new Paragraph(
                            new Run(new Text("DIVERS"))
                        ));
                        ApplyParagraphStyle(diversTitle, "Heading4");

                        var diversContent = request.Divers ?? "Aucun point divers à signaler.";
                        var diversParagraphes = diversContent.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
                        foreach (var paragraphe in diversParagraphes)
                        {
                            if (!string.IsNullOrWhiteSpace(paragraphe))
                            {
                                body.AppendChild(new Paragraph(
                                    new Run(new Text(paragraphe.Trim()))
                                ));
                            }
                        }

                        // Ajouter les styles
                        AddDocumentStyles(mainPart);

                        // Sauvegarder le document
                        mainPart.Document.Save();
                    }

                    // Générer le nom de fichier
                    var fileName = $"compte-rendu-{reunion.TypeReunion.Libelle.Replace(" ", "-")}-{reunion.Date:yyyy-MM-dd}.docx";

                    _logger.LogInformation("Compte-rendu généré pour la réunion {ReunionId} du club {ClubId}", reunionId, clubId);

                    // Retourner le document
                    return File(
                        memStream.ToArray(),
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        fileName
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la génération du compte-rendu pour la réunion {ReunionId} du club {ClubId}", reunionId, clubId);
                return StatusCode(500, $"Erreur lors de la génération du document : {ex.Message}");
            }
        }
    }
} 