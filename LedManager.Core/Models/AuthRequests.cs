using System.ComponentModel.DataAnnotations;

namespace LedManager.Core.Models
{
    public class LoginRequest
    {
        [Required]
        public string UserName { get; set; } = default!;
        [Required]
        public string Password { get; set; } = default!;
    }

    public class RegisterRequest
    {
        [Required]
        public string UserName { get; set; } = default!;
        [Required]
        [EmailAddress]
        public string Email { get; set; } = default!;
        public string? FullName { get; set; }
        [Required]
        public string Password { get; set; } = default!;
        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = default!;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = default!;
        public string UserName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public DateTime Expiration { get; set; }
    }
}
