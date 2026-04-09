namespace LedManager.Domain.Entities.Base
{
    public interface IBaseEntity
    {
        int Id { get; set; }

        bool IsDeleted { get; set; }

        DateTimeOffset DeletedAt { get; set; }

        DateTimeOffset CreatedAt { get; set; }

        DateTimeOffset UpdatedAt { get; set; }

        int DeletedBy { get; set; }

        int CreatedBy { get; set; }

        int UpdatedBy { get; set; }
    }

    public class BaseEntity : IBaseEntity
    {
        public int Id { get; set; }

        public bool IsDeleted { get; set; }

        public DateTimeOffset DeletedAt { get; set; }

        public DateTimeOffset CreatedAt { get; set; }

        public DateTimeOffset UpdatedAt { get; set; }

        public int DeletedBy { get; set; }

        public int CreatedBy { get; set; }

        public int UpdatedBy { get; set; }

        public void UpdateTimeStamps()
        {
            if (!IsDeleted && Id > 0)
            {
                UpdatedAt = DateTimeOffset.UtcNow;
            }
            else if (!IsDeleted && Id == 0)
            {
                CreatedAt = DateTimeOffset.UtcNow;
            }
            else if (IsDeleted && Id > 0)
            {
                DeletedAt = DateTimeOffset.UtcNow;
            }
            else if (IsDeleted && Id == 0)
            {
                throw new NotSupportedException("Cannot delete a new entity");
            }
        }
    }
}
