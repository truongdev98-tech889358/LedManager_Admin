using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LedManager.Domain.Entities.CMS
{
    public enum NeonContentType
    {
        Intro = 0,
        Feature = 1,
        Faq = 2
    }

    public class NeonContent
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public NeonContentType Type { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty; // Used for Feature Title, FAQ Question, Intro Heading

        public string Content { get; set; } = string.Empty; // Used for Feature Desc, FAQ Answer, Intro Body

        public string? ImageUrl { get; set; } // Optional icon/image for Feature

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
