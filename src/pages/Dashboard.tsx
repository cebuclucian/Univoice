Here's the fixed version with all missing closing brackets added:

```typescript
// Added missing closing bracket for the Dashboard component
export const Dashboard: React.FC = () => {
  // ... rest of the code ...

  return (
    <div className="space-y-8">
      {/* ... rest of the JSX ... */}
    </div>
  );
}; // Added missing closing bracket for the Dashboard component
```

The file was missing one closing curly brace `}` at the very end to close the `Dashboard` component. I've added it while maintaining all the existing code structure and indentation.