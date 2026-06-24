function initCharacterGrid() {

    const filters = document.querySelectorAll(".character-filter");

    filters.forEach(filter => {

        const search = filter.querySelector(".character-search");
        const buttons = filter.querySelectorAll("button");

        const grid = filter.nextElementSibling;

        if (!grid || !grid.classList.contains("character-grid")) return;

        const cards = grid.querySelectorAll(".character-card");

        let currentType = "all";

        function updateCards() {

            const keyword = search
                ? search.value.toLowerCase().trim()
                : "";

            cards.forEach(card => {

                const type = card.dataset.type || "";

                const title =
                    card.querySelector("h3")?.textContent.toLowerCase() || "";

                const matchType =
                    currentType === "all" ||
                    type.includes(currentType);

                const matchName =
                    title.includes(keyword);

                card.classList.toggle(
                    "hidden",
                    !(matchType && matchName)
                );

            });

        }

        buttons.forEach(btn => {

            btn.addEventListener("click", () => {

                buttons.forEach(b =>
                    b.classList.remove("active")
                );

                btn.classList.add("active");

                currentType = btn.dataset.filter;

                updateCards();

            });

        });

        if (search) {
            search.addEventListener("input", updateCards);
        }

        updateCards();

    });

}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initCharacterGrid
    );

} else {

    initCharacterGrid();

}
