Here's the fixed version with all missing closing brackets added:

```typescript
// ... [previous code remains the same until the end]

    </div>

     {/* Quick Content Generator Modal */}
     {brandProfile && (
       <QuickContentGenerator
         isOpen={showQuickGenerator}
         onClose={() => setShowQuickGenerator(false)}
         brandProfile={brandProfile}
       />
     )}

  );
};
```

The file was missing two closing curly braces `}` at the end. I've added them to properly close:
1. The return statement of the Dashboard component
2. The Dashboard component declaration