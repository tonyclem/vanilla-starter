function createPokemonsView(props) {
  const root = document.createElement('div');
  root.className = 'flex-column';
  root.innerHTML = String.raw`
    <header class="header">
      <div class="header-content">
        <div>Pokemons</div>
      </div>
    </header>
    <button type="button" id="btn-get">Get Pokemons</button>
    <select id="pokemons-select">
      <option value="">No pokemons yet</option>
    </select>
    <img id="pokemon-img" hidden>
    <div id="message-container"></div>
  `;

  const btnGet = root.querySelector('#btn-get');
  btnGet.addEventListener('click', props.onGetClick);

  const pokemonsSelect = root.querySelector('#pokemons-select');
  pokemonsSelect.addEventListener('change', props.onChange);

  const pokemonImg = root.querySelector('#pokemon-img');

  const messageContainer = root.querySelector('#message-container');

  let pokemonsPopulated = false;

  const update = (state) => {
    if (state.loading) {
      messageContainer.textContent = 'Loading...';
      return;
    }

    if (state.error) {
      messageContainer.textContent = state.error.message;
      return;
    }

    messageContainer.textContent = '';

    if (state.pokemons && !pokemonsPopulated) {
      pokemonsSelect.innerHTML = '';
      state.pokemons.forEach((pokemon) => {
        const option = document.createElement('option');
        option.textContent = pokemon.name;
        option.value = pokemon.url;
        pokemonsSelect.appendChild(option);
      });
      pokemonsPopulated = true;
      btnGet.disabled = true;
    }

    if (state.pokemon) {
      pokemonImg.hidden = false;
      pokemonImg.src = state.pokemon.sprites.front_default;
      pokemonImg.alt = state.pokemon.name;
    }
  };

  return { root, update };
}

export default createPokemonsView;
