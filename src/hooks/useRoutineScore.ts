import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { addDays, startOfDay, format } from "date-fns";

const toDateStr = (d: Date) => format(d, "yyyy-MM-dd");

export interface RoutineScore {
  loading: boolean;
  hasRoutine: boolean;
  score: number | null;         // 0..100 or null
  expected: number;
  completed: number;
  streak: number;
  windowDays: number;
}

export function useRoutineScore(windowDays = 7): RoutineScore {
  const { user } = useAuth();
  const [state, setState] = useState<RoutineScore>({
    loading: true,
    hasRoutine: false,
    score: null,
    expected: 0,
    completed: 0,
    streak: 0,
    windowDays,
  });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const today = startOfDay(new Date());
      const from = addDays(today, -(windowDays - 1));

      const { data: routine } = await supabase
        .from("skincare_routines")
        .select("id, active_weekdays")
        .eq("patient_id", user.id)
        .maybeSingle();

      if (!routine) {
        if (!cancelled)
          setState({
            loading: false,
            hasRoutine: false,
            score: null,
            expected: 0,
            completed: 0,
            streak: 0,
            windowDays,
          });
        return;
      }

      const [{ data: steps }, { data: events }] = await Promise.all([
        supabase
          .from("skincare_routine_steps")
          .select("id, moment")
          .eq("routine_id", routine.id),
        supabase
          .from("skincare_calendar_events")
          .select("event_date, completed_at, step_id")
          .eq("patient_id", user.id)
          .gte("event_date", toDateStr(from))
          .lte("event_date", toDateStr(today)),
      ]);

      const activeWeekdays: number[] = (routine as any).active_weekdays || [];
      const stepsPerDay = (steps || []).length;

      let expected = 0;
      const doneByDay = new Map<string, number>();
      (events || []).forEach((e: any) => {
        if (!e.completed_at) return;
        doneByDay.set(e.event_date, (doneByDay.get(e.event_date) || 0) + 1);
      });

      const perDayExpected = new Map<string, number>();
      for (let i = 0; i < windowDays; i++) {
        const d = addDays(from, i);
        const active = activeWeekdays.includes(d.getDay());
        const exp = active ? stepsPerDay : 0;
        perDayExpected.set(toDateStr(d), exp);
        expected += exp;
      }

      let completed = 0;
      doneByDay.forEach((n, day) => {
        const exp = perDayExpected.get(day) || 0;
        completed += Math.min(n, exp || n);
      });

      // Streak: consecutive days ending today where done >= expected (and expected>0)
      let streak = 0;
      for (let i = windowDays - 1; i >= 0; i--) {
        const d = addDays(from, i);
        const key = toDateStr(d);
        const exp = perDayExpected.get(key) || 0;
        const done = doneByDay.get(key) || 0;
        if (exp > 0 && done >= exp) streak++;
        else break;
      }

      const score = expected > 0 ? Math.round((completed / expected) * 100) : null;

      if (!cancelled)
        setState({
          loading: false,
          hasRoutine: true,
          score,
          expected,
          completed,
          streak,
          windowDays,
        });
    })();

    return () => {
      cancelled = true;
    };
  }, [user, windowDays]);

  return state;
}
