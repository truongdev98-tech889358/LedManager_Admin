using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using LedManager.Core.Exceptions;
using LedManager.Core.Models;
using LedManager.Core.Services;
using LedManager.Domain.Entities.System;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace LedManager.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;

        public AuthService(UserManager<User> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByNameAsync(request.UserName);
            if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            {
                throw new ValidationException("Invalid username or password.");
            }

            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var userRoles = await _userManager.GetRolesAsync(user);
            foreach (var role in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            var token = GetToken(authClaims);

            return new AuthResponse
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                UserName = user.UserName!,
                Email = user.Email ?? "",
                Expiration = token.ValidTo
            };
        }

        public async Task<bool> RegisterAsync(RegisterRequest request)
        {
            var userExists = await _userManager.FindByNameAsync(request.UserName);
            if (userExists != null)
                throw new ValidationException("User already exists!");

            User user = new()
            {
                Email = request.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = request.UserName,
                FullName = request.FullName,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                throw new ValidationException($"User creation failed! {string.Join(", ", result.Errors.Select(e => e.Description))}");

            return true;
        }

        private JwtSecurityToken GetToken(List<Claim> authClaims)
        {
            var secret = _configuration["Jwt:Key"] ?? "ByDefaultThisShouldBeALongSecretKeyForDevelopmentOnly123!";
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return token;
        }
    }
}
