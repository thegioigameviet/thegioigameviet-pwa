document.addEventListener("DOMContentLoaded", () => {

    const filters = document.querySelectorAll(".character-filter");

    filters.forEach(filter => {

        const search = filter.querySelector(".character-search");

        const buttons = filter.querySelectorAll("button");

        const grid = filter.nextElementSibling;

        if (!grid || !grid.classList.contains("character-grid")) return;

        const cards = grid.querySelectorAll(".character-card");

        let currentType = "all";

        function updateCards(){

            const keyword = search.value.toLowerCase().trim();

            cards.forEach(card=>{

                const type = card.dataset.type || "";

                const name = card.dataset.name || "";

                const matchType = currentType==="all" || type.includes(currentType);

                const matchName = name.includes(keyword);

                card.classList.toggle("hidden", !(matchType && matchName));

            });

        }

        buttons.forEach(btn=>{

            btn.addEventListener("click",()=>{

                buttons.forEach(b=>b.classList.remove("active"));

                btn.classList.add("active");

                currentType = btn.dataset.filter;

                updateCards();

            });

        });

        search.addEventListener("input",updateCards);

    });

});
