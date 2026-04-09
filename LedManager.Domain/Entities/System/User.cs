using Microsoft.AspNetCore.Identity;

namespace LedManager.Domain.Entities.System
{
    public class User : IdentityUser<int>
    {
        public string? FullName { get; set; }
        public bool IsActive { get; set; }
        
        // Custom Audit properties since we can't inherit BaseEntity (C# single inheritance)
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Note { get; set; }
        public string? Role { get; set; }
        public int? GroupId { get; set; }
        public string? Permissions { get; set; }
        public bool IsDeleted { get; set; }
    }
}
