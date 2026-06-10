import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

export function GoalForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    title: '',
    category: 'coding',
    priority: 'medium',
    targetDate: '',
    milestones: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const milestones = form.milestones
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((title) => ({ title }));

    onSubmit({
      title: form.title,
      category: form.category,
      priority: form.priority,
      ...(form.targetDate && { targetDate: new Date(form.targetDate).toISOString() }),
      ...(milestones.length && { milestones }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Goal title</Label>
        <Input
          placeholder="e.g. Master React hooks"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['dsa', 'coding', 'learning', 'career', 'other'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['low', 'medium', 'high'].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Target date (optional)</Label>
        <Input
          type="date"
          value={form.targetDate}
          onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Milestones (one per line, optional)</Label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Learn useState&#10;Learn useEffect&#10;Build a project"
          value={form.milestones}
          onChange={(e) => setForm({ ...form, milestones: e.target.value })}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating...' : 'Create goal'}
      </Button>
    </form>
  );
}
