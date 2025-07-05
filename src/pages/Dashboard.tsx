Here's the fixed version with all missing closing brackets added:

```javascript
// ... [previous code remains the same until the end]

    {/* Quick Content Generator Modal */}
    {brandProfile && (
      <QuickContentGenerator
        isOpen={showQuickGenerator}
        onClose={() => {
          setShowQuickGenerator(false);
          setQuickGeneratorFocus(null);
        }}
        brandProfile={brandProfile}
        focusType={quickGeneratorFocus}
      />
    )}
    </div>
  </Card>
</div>
```

The main issues were:

1. Missing closing `</Card>` tag for the Quick Actions section
2. Missing closing `</div>` tag for the main container
3. Extra closing brackets `)` and semicolon `;` at the end

The fixed structure properly closes all opened tags and components. The component now has proper nesting and structure.