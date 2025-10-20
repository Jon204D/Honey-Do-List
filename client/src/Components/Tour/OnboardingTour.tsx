import { useEffect, useRef } from "react";
import { driver, DriveStep } from "driver.js";

// npm install driver.js //

const STORAGE_KEY = "hd_tour_done_v1";

export default function OnboardingTour({ isAuthed }: { isAuthed: boolean }) {
  const drv = useRef<ReturnType<typeof driver> | null>(null);

  const startDriver = (steps: DriveStep[], startIndex = 0, extra?: any) => {
    drv.current?.destroy();
    drv.current = driver({
      showProgress: true,
      allowClose: false,
      overlayOpacity: 0.6,
      stagePadding: 6,
      // let users click real UI elements
      // @ts-ignore
      stageRadius: 14,
      disableActiveInteraction: false,
      ...(extra || {}),
      steps,
    })
    drv.current.drive(startIndex);
  }

  const q = (sel: string) => document.querySelector(sel);
  const qa = (sel: string) => document.querySelectorAll(sel);

  // 1) TaskBoard steps
  const baseSteps: DriveStep[] = [
    {
      element: "body",
      popover: {
        title: "Welcome to Honey-Do List!",
        description: "Collaborate with your partner and make a shared list for your needs. Lets go through and make one right now!",
      }
    },
    {
      element: "[data-tour='create-task-button']",
      popover: {
        title: "Lets create a task",
        side: "left",
        align: "center",
      },
      // @ts-ignore
      disableActiveInteraction: false,
    }
  ]

  // 2) Modal steps
  const modalSteps: DriveStep[] = [
    {
      element: "[data-tour='task-title']",
      popover: {
        title: "Title",
        description: "Give your task a short, clear name.",
        side: "left",
        align: "start",
      }
    },
    {
      element: "[data-tour='task-desc']",
      popover: {
        title: "Description",
        description: "Add helpful context about what needs to be done.",
        side: "left",
        align: "center",
      }
    },
    {
      element: "[data-tour='task-status']",
      popover: {
        title: "Status",
        description: "Track progress: Pending, In Progress, or Completed.",
        side: "left",
        align: "start",
      }
    },
    {
      element: "[data-tour='task-priority']",
      popover: {
        title: "Priority",
        description: "Set urgency: Low, Medium, or High.",
        side: "left",
        align: "start",
      }
    },
    {
      element: "[data-tour='task-date']",
      popover: {
        title: "Due Date",
        description: "Choose when this task is due.",
        side: "left",
        align: "start",
      }
    },
    {
      element: "[data-tour='create-task']",
      popover: {
        title: "Save It",
        description: "Click here to create your task.",
        side: "left",
        align: "center",
      }
    }
  ]

  // 3) After first card exists → card → filter → final Login CTA
  const cardFilterAndFinal = (cardEl: Element | null): DriveStep[] => [
    {
      element: cardEl ? cardEl : "[data-tour='task-list']",
      popover: {
        title: "Your Task Card",
        description:
          "You can edit or delete it anytime.",
        side: "bottom",
        align: "start",
      }
    },
    {
      element: "[data-tour='task-filter']",
      popover: {
        title: "Filter Tasks",
        description: "Quickly find tasks by status, priority, or date.",
        side: "bottom",
        align: "start",
      }
    },
    {
      element: "[data-tour='profile-button']",
      popover: {
        title: "Good Job!",
        description:
          "Now that you know what to do, lets make an account so you can invite people. Click below to log in or sign up!",
        side: "left",
        align: "center",
        nextBtnText: "Go to Login",
        // @ts-ignore — newer driver.js accepts an array of allowed buttons
        showButtons: ["next"],
        // @ts-ignore
        onNextClick: () => {
          window.location.assign("/login");
        }
      },
    }
  ]

  useEffect(() => {
    if (isAuthed) return;

    const forced = new URLSearchParams(window.location.search).get("tour") === "1";
    const seen = localStorage.getItem(STORAGE_KEY) === "true";
    if (!forced && seen) return;

    // Start at welcome
    startDriver(baseSteps);

    let phase: 0 | 1 | 2 = 0; // 0=base, 1=modal, 2=final

    // Watch for modal to open (to show modal steps) and for first card as a fallback
    const observer = new MutationObserver(() => {
      if (phase === 0 && q("[data-tour='task-title']")) {
        phase = 1;
        startDriver([...baseSteps, ...modalSteps], 2);
      }
      if (phase <= 1) {
        const firstCard = qa("[data-tour='task-card']")[0] || null;
        if (firstCard) {
          phase = 2;
          // base(2) + modal(6) = 8 → start at index 8 (card step)
          startDriver([...baseSteps, ...modalSteps, ...cardFilterAndFinal(firstCard)], 8);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // When a task is created, destroy current tour and restart at the card step.
    const goToCardFilterFinal = () => {
      // poll up to ~2s for the first card to exist (handles React render timing)
      let tries = 0;
      const maxTries = 40; // 40*50ms = 2000ms
      const tick = () => {
        const firstCard = document.querySelector("[data-tour='task-card']");
        if (firstCard || tries >= maxTries) {
          drv.current?.destroy();
          startDriver(
            [...baseSteps, ...modalSteps, ...cardFilterAndFinal(firstCard || null)],
            8
          );
          return;
        }
        tries += 1;
        setTimeout(tick, 50);
      }
      setTimeout(tick, 0);
    }

    const onTaskCreated = () => {
      if (phase !== 2) {
        phase = 2;
        goToCardFilterFinal();
      }
    }

    const onAuthSuccess = () => {
      drv.current?.destroy();
      localStorage.setItem(STORAGE_KEY, "true");
    }

    window.addEventListener("task-created", onTaskCreated);
    window.addEventListener("auth-success", onAuthSuccess);

    return () => {
      observer.disconnect();
      window.removeEventListener("task-created", onTaskCreated);
      window.removeEventListener("auth-success", onAuthSuccess);
    }
  }, [isAuthed]);

  return null;
}
