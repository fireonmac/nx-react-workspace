import { useState, useEffect } from 'react';
import { BehaviorSubject, Observable } from 'rxjs';

export function useObservableState<T>(observable: Observable<T>): T | undefined;
export function useObservableState<T>(
  observable: Observable<T>,
  initialValue: T
): T;
export function useObservableState<T>(
  observable: Observable<T>,
  initialValue?: T
): T | undefined {
  // Determine the initial state:
  // - Use explicit initialValue if provided.
  // - If no initialValue and observable is BehaviorSubject, use its current value.
  // - Otherwise, start as undefined (matching the overload).
  const getInitialState = (): T | undefined => {
    if (initialValue !== undefined) {
      return initialValue;
    }
    if (observable instanceof BehaviorSubject) {
      return observable.getValue();
    }
    return undefined;
  };

  // Use a function for lazy initialization of state
  const [value, setValue] = useState<T | undefined>(getInitialState);

  useEffect(() => {
    const subscription = observable.subscribe(setValue);
    return () => {
      subscription.unsubscribe();
    };
  }, [observable]);

  // Simply return the current state value. The overloads handle the external typing.
  return value;
}
