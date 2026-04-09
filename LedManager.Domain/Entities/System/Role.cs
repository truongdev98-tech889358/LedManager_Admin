using System;
using Microsoft.AspNetCore.Identity;

namespace LedManager.Domain.Entities.System
{
    public class Role : IdentityRole<int>
    {
        public string? Description { get; set; }
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
    }
}
