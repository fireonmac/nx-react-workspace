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
  // Refs to store the latest callbacks/observer
  const latestObserverOrNextRef = useRef(observerOrNext);
  const latestErrorRef = useRef(error);
  const latestCompleteRef = useRef(complete);

  useEffect(() => {
    let actualObserver: Observer<T>;

    // Check which overload was used based on the type of the *latest* second argument from the ref
    if (typeof latestObserverOrNextRef.current === 'function') {
      // First overload was used: (observable, next, error?, complete?)
      // Construct the observer using functions from refs
      actualObserver = {
        next: latestObserverOrNextRef.current,
        error: latestErrorRef.current,
        complete: latestCompleteRef.current,
      };
    } else {
      // Second overload was used: (observable, observer)
      // Use the observer object directly from the ref
      actualObserver = latestObserverOrNextRef.current;
    }

    subscriptionRef.current = observable.subscribe(actualObserver);

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
    // Only depend on the observable; callbacks are accessed via refs
  }, [observable]);

  return subscriptionRef;
}
