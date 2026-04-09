using System.Collections.Generic;

namespace LedManager.Core.Models
{
    public class UserViewModel
    {
        public int Id { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? FullName { get; set; }
        public string? Note { get; set; }
        public List<string>? Roles { get; set; }
        public string? Role { get; set; }
        public int? GroupId { get; set; }
        public string? Permissions { get; set; }
        public bool IsActive { get; set; }
        public string? Password { get; set; } // Only used for Create/Update password
    }

    public class UserListRequest : PagingRequest
    {
    }
}
