let mapa, directionsService, directionsRenderer;
let horarioChegada = ""; // Variável global para armazenar o horário de chegada
let enderecoChegada = ""; // Variável global para armazenar o endereço de chegada
let horarioVisitaFinalizada = ""; // Variável global para armazenar o horário de visita finalizada
let dataVisitaFinalizada = ""; // Variável global para armazenar a data de visita finalizada

async function enviarDadosParaPlanilha(formData) {
    try {
        const response = await fetch("https://api.sheetmonkey.io/form/8Vh23kz2vmQtoVFqLxW4CU", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer SUA_CHAVE_AQUI"
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            console.error('Erro ao enviar dados para a planilha. Status:', response.status);
        }
    } catch (error) {
        console.error('Erro inesperado ao enviar dados para a planilha:', error);
    }
}

function obterCoordenada(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Geocodificação reversa para obter o endereço da origem
                const geocoder = new google.maps.Geocoder();
                const latlng = new google.maps.LatLng(latitude, longitude);

                geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        const origemEndereco = results[0].formatted_address;
                        document.getElementById('origem').value = origemEndereco;

                        // Chamar o callback se fornecido
                        if (callback && typeof callback === 'function') {
                            callback(origemEndereco);
                        }
                    } else {
                        alert('Erro ao obter o endereço da origem. Status: ' + status);
                    }
                });
            },
            function (error) {
                console.error('Erro ao obter a localização:', error);
                alert('Erro ao obter a localização. Por favor, tente novamente.');
            },
            { enableHighAccuracy: true }
        );
    } else {
        alert('Geolocalização não suportada no seu navegador.');
    }
}

function iniciarVisita() {
    const consultorNome = document.getElementById('consultorNome').value;
    const data = document.getElementById('data').value;
    const origemInput = document.getElementById('origem');
    const origem = origemInput.value;

    if (!origem) {
        alert('Por favor, clique em "Puxar Localização" para obter o endereço de origem.');
        return;
    }

    const destinoSelecionado = document.getElementById('destino').value;
    const destinoEndereco = empresas[destinoSelecionado];

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': destinoEndereco }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            const destinoCoordenadas = results[0].geometry.location;

            geocoder.geocode({ 'address': origem }, function (resultsOrigem, statusOrigem) {
                if (statusOrigem === google.maps.GeocoderStatus.OK) {
                    const origemCoordenadas = resultsOrigem[0].geometry.location;

                    const resultado = document.getElementById('resultado');
                    resultado.innerHTML = `
                        <p><strong>Consultor:</strong> ${consultorNome}</p>
                        <p><strong>Data:</strong> ${data}</p>
                        <p><strong>Está saindo de:</strong> ${origem}</p>
                        <p><strong>Indo para:</strong> ${destinoSelecionado} - ${destinoEndereco}</p>
                        <p><strong>Coordenadas do Destino:</strong> Latitude: ${destinoCoordenadas.lat()}, Longitude: ${destinoCoordenadas.lng()}</p>
                    `;

                    // Configurar o renderer de direções para o mapa
                    directionsRenderer = new google.maps.DirectionsRenderer();
                    directionsService = new google.maps.DirectionsService();
                    mapa = new google.maps.Map(document.getElementById('mapa'), {
                        zoom: 12,
                        center: destinoCoordenadas
                    });

                    // Adicionar marcadores no mapa
                    const marcadorOrigem = new google.maps.Marker({
                        position: origemCoordenadas,
                        map: mapa,
                        title: 'Origem'
                    });

                    const marcadorDestino = new google.maps.Marker({
                        position: destinoCoordenadas,
                        map: mapa,
                        title: 'Destino'
                    });

                    // Configurar o renderer de direções para o mapa
                    directionsRenderer.setMap(mapa);

                    // Traçar a rota no mapa
                    const request = {
                        origin: origem,
                        destination: destinoEndereco,
                        travelMode: 'DRIVING'
                    };

                    directionsService.route(request, function (result, status) {
                        if (status == 'OK') {
                            directionsRenderer.setDirections(result);
                            document.getElementById('mapa').style.height = '400px'; // Ajustar a altura conforme necessário
                            document.getElementById('resultado').style.display = 'block';
                        } else {
                            alert('Erro ao iniciar a rota. Por favor, tente novamente.');
                        }
                    });

                    // Capturar o horário de início da visita e atualizar o input oculto
const horarioInicio = new Date();
document.getElementById('horarioInicio').value = horarioInicio.toISOString();
                // Enviar dados para a planilha
                enviarDadosParaPlanilha({
                    consultorNome: consultorNome,
                    data: data,
                    origem: origem,
                    destino: destinoSelecionado,
                    horarioInicio: horarioInicio.toISOString(),
                    coordenadasDestino: {
                        latitude: destinoCoordenadas.lat(),
                        longitude: destinoCoordenadas.lng()
                    }
                });
            } else {
                alert('Erro ao obter as coordenadas de origem. Por favor, verifique o endereço.');
            }
        });
    } else {
        alert('Erro ao obter as coordenadas do destino. Por favor, verifique o endereço.');
    }
});
}

// Função para ser chamada ao clicar em "Cheguei ao Destino"
function chegouAoDestino() {
// Capturar o horário de chegada e atualizar a variável global
horarioChegada = new Date().toISOString();
// Obter a localização atual do usuário
obterCoordenada(function (endereco) {
    enderecoChegada = endereco;

    // Exibir pop-up
    alert("Cheguei ao destino com sucesso!");

    // Adicionar os dados de chegada à planilha
    enviarDadosParaPlanilha({
        horarioChegada: horarioChegada,
        enderecoChegada: enderecoChegada
    });
});
}

// Função para ser chamada ao clicar em "Visita Finalizada"
function visitaFinalizada() {
// Capturar o horário de visita finalizada e a data atual
horarioVisitaFinalizada = new Date().toISOString();
dataVisitaFinalizada = new Date().toLocaleDateString();
// Enviar dados para a planilha
enviarDadosParaPlanilha({
    horarioVisitaFinalizada: horarioVisitaFinalizada,
    dataVisitaFinalizada: dataVisitaFinalizada
});

// Exibir pop-up
alert("Visita finalizada com sucesso!");
}

// ... (restante do código)

