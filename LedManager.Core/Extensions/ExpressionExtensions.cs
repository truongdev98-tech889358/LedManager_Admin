using System.Linq.Expressions;

namespace LedManager.Core.Extensions
{
    public static class ExpressionExtensions
    {
        public static Expression<Func<T, bool>> And<T>(this Expression<Func<T, bool>> left, Expression<Func<T, bool>> right)
        {
            var parameter = Expression.Parameter(typeof(T));
            var leftVisitor = new ReplaceExpressionVisitor(left.Parameters[0], parameter);
            var leftBody = leftVisitor.Visit(left.Body)
                ?? throw new InvalidOperationException("Left expression body cannot be null.");
            
            var rightVisitor = new ReplaceExpressionVisitor(right.Parameters[0], parameter);

            var rightBody = rightVisitor.Visit(right.Body)
                ?? throw new InvalidOperationException("Right expression body cannot be null.");
            return Expression.Lambda<Func<T, bool>>(Expression.AndAlso(leftBody, rightBody), parameter);
        }

        private class ReplaceExpressionVisitor : ExpressionVisitor
        {
            private readonly Expression _oldValue;
            private readonly Expression _newValue;

            public ReplaceExpressionVisitor(Expression oldValue, Expression newValue)
            {
                _oldValue = oldValue;
                _newValue = newValue;
            }

            public override Expression? Visit(Expression? node)
            {
                if (node == _oldValue)
                    return _newValue;

                return base.Visit(node);
            }

        }
    }
}
