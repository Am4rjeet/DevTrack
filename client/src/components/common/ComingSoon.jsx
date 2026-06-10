import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ComingSoon({ title, description, phase = 8 }) {
  return (
    <div className="animate-fade-in">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Full UI coming in <span className="font-medium text-primary">Phase {phase}</span>.
            The backend API is ready and wired.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
