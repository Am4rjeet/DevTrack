import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const TYPES = ['coding', 'dsa', 'learning', 'project', 'other'];
const PLATFORMS = ['leetcode', 'hackerrank', 'codeforces', 'codewars', 'other'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const defaultForm = {
  type: 'coding',
  title: '',
  description: '',
  durationMinutes: 60,
  date: new Date().toISOString().slice(0, 10),
  platform: 'leetcode',
  difficulty: 'medium',
  problemUrl: '',
};

export function ProgressForm({ onSubmit, loading, initial }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      type: form.type,
      title: form.title,
      description: form.description,
      durationMinutes: Number(form.durationMinutes),
      date: new Date(form.date).toISOString(),
    };
    if (form.type === 'dsa') {
      payload.metadata = {
        platform: form.platform,
        difficulty: form.difficulty,
        ...(form.problemUrl && { problemUrl: form.problemUrl }),
      };
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          placeholder="e.g. Built auth module / Two Sum"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Duration (minutes)</Label>
        <Input
          type="number"
          min={1}
          max={1440}
          value={form.durationMinutes}
          onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
          required
        />
      </div>

      {form.type === 'dsa' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Problem URL (optional)</Label>
            <Input
              type="url"
              placeholder="https://leetcode.com/problems/..."
              value={form.problemUrl}
              onChange={(e) => setForm({ ...form, problemUrl: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Log activity'}
      </Button>
    </form>
  );
}
