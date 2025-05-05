import { useRef, useEffect } from 'react'; // Import useRef
import { Observable, Subscription } from 'rxjs';

type NextFunction<T> = (value: T) => void;
type ErrorFunction = (error: any) => void;
type CompleteFunction = () => void;
type Observer<T> = {
  next?: NextFunction<T>;
  error?: ErrorFunction;
  complete?: CompleteFunction;
};

export function useSubscription<T>(
  observable: Observable<T>,
  next: NextFunction<T>, // This overload signature is not compatible with its implementation signature.
  error?: ErrorFunction,
  complete?: CompleteFunction
): React.RefObject<Subscription | undefined>;
export function useSubscription<T>(
  observable: Observable<T>,
  observer: Observer<T>
): React.RefObject<Subscription | undefined>;
export function useSubscription<T>(
  observable: Observable<T>,
  observerOrNext: Observer<T> | NextFunction<T>,
  error?: ErrorFunction,
  complete?: CompleteFunction
): React.RefObject<Subscription | undefined> {
  // Implementation return type matches overloads
  const subscriptionRef = useRef<Subscription | undefined>(undefined);

  useEffect(() => {
    let actualObserver: Observer<T>;

    // Check which overload was used based on the type of the second argument
    if (typeof observerOrNext === 'function') {
      // First overload was used: (observable, next, error?, complete?)
      actualObserver = { next: observerOrNext, error, complete };
    } else {
      // Second overload was used: (observable, observer)
      actualObserver = observerOrNext;
    }

    subscriptionRef.current = observable.subscribe(actualObserver);

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
    // Dependency array needs to include all potential inputs that affect the subscription
  }, [observable, observerOrNext, error, complete]);

  return subscriptionRef;
}
