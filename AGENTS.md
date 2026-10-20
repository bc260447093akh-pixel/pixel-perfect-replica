<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use the original site CSS classes and a shared MarketButton wrapper for marketplace controls so ecommerce additions retain the existing visual language.
- Keep external API contracts and public catalog query options in the marketplace library; a public Vite base URL switches between explicit preview products and live requests, with no local backend.
- Keep sample account fixtures and in-memory operations in marketplace-demo; MarketProvider restores preview roles from separate tab storage only with an empty API URL, so mock identities never authenticate live requests.
- Shared auth/cart state lives in MarketProvider; auth uses the external JWT contract and protected API reads mount only after restored-session role checks, while the backend remains the permission authority.
- Content pages are separate TanStack leaf routes with unique head metadata; the root provides shared marketplace navigation and footer.
- Use MarketImage for bundled product imagery with explicit WebP width variants and CSS-slot sizes; lazy-load by default, keeping only the first homepage banner eager, and leave external image URLs unchanged without a transformer contract.
