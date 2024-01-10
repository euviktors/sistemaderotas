function obterCoordenada() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            document.getElementById('origem').value = `Latitude: ${latitude}, Longitude: ${longitude}`;
        });
    } else {
        alert('Geolocalização não suportada no seu navegador.');
    }
}

function iniciarVisita() {
    const consultorNome = document.getElementById('consultorNome').value;
    const origem = document.getElementById('origem').value;
    const destinoSelecionado = document.getElementById('destino').value;

    // Dados das empresas
    const empresas = {
        Compos: "R. Frederico Simões, 85 - sala 1103 - Caminho das Árvores, Salvador - BA, 41820-774",
        FarolBarra: "Largo do Farol da Barra, S/N - Barra, Salvador - BA, 40140-650",
        FarolItapuan: "R. Farol de Itapuã, s/n - Itapuã, Salvador - BA, 41630-240",
        ShoppingBahia: "Av. Tancredo Neves, 148 - Caminho das Árvores, Salvador - BA, 41820-020",
        ShoppingParalela: "Av. Luís Viana Filho, 8544 - Alphaville, Salvador - BA, 41730-101",
        SalvadorShopping: "Av. Tancredo Neves, 3133 - Caminho das Árvores, Salvador - BA, 41820-021"
    };

    const destinoEndereco = empresas[destinoSelecionado];

    // Geocodificação reversa
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': destinoEndereco }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            const destinoCoordenadas = results[0].geometry.location;
            
            const resultado = document.getElementById('resultado');
            resultado.innerHTML = `
                <p>Consultor: ${consultorNome}</p>
                <p>Está saindo de: ${origem}</p>
                <p>Indo para: ${destinoSelecionado} - ${destinoEndereco}</p>
                <p>Coordenadas do Destino: Latitude: ${destinoCoordenadas.lat()}, Longitude: ${destinoCoordenadas.lng()}</p>
            `;
        } else {
            alert('Erro ao obter as coordenadas do destino. Por favor, verifique o endereço.');
        }
    });
}
