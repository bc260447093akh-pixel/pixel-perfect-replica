import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import pageHtml from "@/site/page.html?raw";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kings Burger — Fastest Delivery & Easy Pickup" },
      { name: "description", content: "Kings Burger restaurant: delicious burgers, pizza and platters. View the menu and reserve a table." },
      { property: "og:title", content: "Kings Burger" },
      { property: "og:description", content: "Delicious burgers, pizza and platters. Reserve a table today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" },
      { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" },
      { rel: "stylesheet", href: "/site.css" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const navMenu = document.getElementById("nav-menu");
    const navClose = document.getElementById("nav-close");
    const navToggle = document.getElementById("nav-toggle");
    const show = () => navMenu?.classList.add("show-menu");
    const hide = () => navMenu?.classList.remove("show-menu");
    navToggle?.addEventListener("click", show);
    navClose?.addEventListener("click", hide);
    cleanups.push(() => {
      navToggle?.removeEventListener("click", show);
      navClose?.removeEventListener("click", hide);
    });

    let swiper: { destroy: () => void } | undefined;
    let cancelled = false;
    Promise.all([import("swiper"), import("swiper/modules")]).then(([{ default: Swiper }, { Navigation, Pagination }]) => {
      if (cancelled) return;
      swiper = new Swiper(".home-swiper", {
        modules: [Navigation, Pagination],
        spaceBetween: 30,
        grabCursor: true,
        loop: true,
        pagination: { el: ".swiper-pagination", clickable: true },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      });
    });
    cleanups.push(() => { cancelled = true; swiper?.destroy(); });

    const tabs = document.querySelectorAll<HTMLElement>("[data-target]");
    const tabContents = document.querySelectorAll("[content]");
    tabs.forEach((tab) => {
      const onClick = () => {
        const target = document.querySelector(tab.dataset["target"]!);
        tabContents.forEach((c) => c.classList.remove("active-tab"));
        target?.classList.add("active-tab");
        tabs.forEach((t) => t.classList.remove("active-tab"));
        tab.classList.add("active-tab");
      };
      tab.addEventListener("click", onClick);
      cleanups.push(() => tab.removeEventListener("click", onClick));
    });

    const scrollUp = () => {
      const el = document.getElementById("scroll-up");
      if (window.scrollY >= 300) el?.classList.add("show-scroll");
      else el?.classList.remove("show-scroll");
    };
    window.addEventListener("scroll", scrollUp);
    cleanups.push(() => window.removeEventListener("scroll", scrollUp));

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: pageHtml }} />;
}
