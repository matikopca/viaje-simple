export const thailandItinerary = [

    {
    day: 1,
    date: "2026-04-23",
    location: "Bangkok → Krabi",
    title: "Llegada a Tailandia",
    
    transport: {
    type: "flight",
    from: "Bangkok",
    to: "Krabi",
    duration: "1h 25m",
    priceUSD: 60
    },
    
    activities: [
    
    {
    place: "Krabi Airport",
    coordinates:{lat:8.0991,lng:98.9862},
    mapUrl:"https://maps.google.com/?q=8.0991,98.9862"
    },
    
    {
    place: "Ao Nang Beach",
    coordinates:{lat:8.0327,lng:98.8236},
    mapUrl:"https://maps.google.com/?q=8.0327,98.8236"
    }
    
    ],
    
    highlights:[
    "Sunset en Ao Nang",
    "Night market"
    ]
    
    },
    {
        day: 2,
        date: "2026-04-24",
        location: "Krabi",
        title: "Península de Railay",
        
        transport: {
        type: "longtail boat",
        from: "Ao Nang Beach",
        to: "Railay Beach",
        duration: "15 min",
        priceUSD: 3
        },
        
        activities: [
        
        {
        place: "Railay Beach",
        coordinates:{lat:8.0062,lng:98.8373},
        mapUrl:"https://maps.google.com/?q=8.0062,98.8373",
        duration:"2-3h",
        priceUSD:0
        },
        
        {
        place: "Phra Nang Cave Beach",
        coordinates:{lat:7.9975,lng:98.8372},
        mapUrl:"https://maps.google.com/?q=7.9975,98.8372",
        duration:"1-2h",
        priceUSD:0
        },
        
        {
        place: "Railay Viewpoint",
        coordinates:{lat:8.0006,lng:98.8380},
        mapUrl:"https://maps.google.com/?q=8.0006,98.8380",
        duration:"45 min hike",
        priceUSD:0
        }
        
        ],
        
        highlights:[
        "Railay Beach",
        "Phra Nang Cave Beach",
        "Acantilados de piedra caliza"
        ]
        
        },
        
        
        {
        day: 3,
        date: "2026-04-25",
        location: "Krabi",
        title: "Hong Islands",
        
        transport:{
        type:"speedboat tour",
        from:"Ao Nang Pier",
        to:"Hong Islands",
        duration:"6-7h island tour",
        priceUSD:45
        },
        
        activities:[
        
        {
        place:"Hong Island Beach",
        coordinates:{lat:8.0727,lng:98.7554},
        mapUrl:"https://maps.google.com/?q=8.0727,98.7554",
        duration:"1-2h",
        priceUSD:0
        },
        
        {
        place:"Hong Lagoon",
        coordinates:{lat:8.0738,lng:98.7610},
        mapUrl:"https://maps.google.com/?q=8.0738,98.7610",
        duration:"30-45m kayak",
        priceUSD:10
        },
        
        {
        place:"Lao Lading Island",
        coordinates:{lat:8.0641,lng:98.7505},
        mapUrl:"https://maps.google.com/?q=8.0641,98.7505",
        duration:"45m stop",
        priceUSD:0
        }
        
        ],
        
        highlights:[
        "Hong Lagoon",
        "Islas de piedra caliza",
        "Snorkel"
        ]
        
        },
    {
    day: 4,
    date: "2026-04-26",
    location: "Krabi → Phi Phi",
    title: "Ferry a Phi Phi",
    
    transport:{
    type:"ferry",
    from:"Krabi",
    to:"Phi Phi Islands",
    duration:"1h 45m",
    priceUSD:25
    },
    
    activities:[
    
    {
    place:"Phi Phi Viewpoint",
    coordinates:{lat:7.7421,lng:98.7784},
    mapUrl:"https://maps.google.com/?q=7.7421,98.7784"
    },
    
    {
    place:"Loh Dalum Beach",
    coordinates:{lat:7.7410,lng:98.7756},
    mapUrl:"https://maps.google.com/?q=7.7410,98.7756"
    }
    
    ]
    
    },
    
    {
    day:5,
    date:"2026-04-27",
    location:"Phi Phi Islands",
    title:"Phi Phi Island Tour",
    
    transport:{
    type:"longtail boat",
    duration:"4-6h island tour",
    priceUSD:35
    },
    
    activities:[
    
    {
    place:"Maya Bay",
    coordinates:{lat:7.6779,lng:98.7667},
    mapUrl:"https://maps.google.com/?q=7.6779,98.7667"
    },
    
    {
    place:"Pileh Lagoon",
    coordinates:{lat:7.7406,lng:98.7784},
    mapUrl:"https://maps.google.com/?q=7.7406,98.7784"
    },
    
    {
    place:"Monkey Beach",
    coordinates:{lat:7.7353,lng:98.7730},
    mapUrl:"https://maps.google.com/?q=7.7353,98.7730"
    }
    
    ]
    
    },
    
    {
    day:6,
    date:"2026-04-28",
    location:"Phi Phi → Phuket",
    title:"Ferry a Phuket",
    
    transport:{
    type:"ferry",
    from:"Phi Phi",
    to:"Phuket",
    duration:"2h",
    priceUSD:25
    },
    
    activities:[
    
    {
    place:"Phuket Old Town",
    coordinates:{lat:7.8846,lng:98.3923},
    mapUrl:"https://maps.google.com/?q=7.8846,98.3923"
    }
    
    ]
    
    },
    
    {
    day:8,
    date:"2026-04-30",
    location:"Phuket → Koh Samui",
    title:"Vuelo al Golfo de Tailandia",
    
    transport:{
    type:"flight",
    from:"Phuket",
    to:"Koh Samui",
    duration:"55m",
    priceUSD:120
    },
    
    activities:[
    
    {
    place:"Big Buddha Temple",
    coordinates:{lat:9.5703,lng:100.0601},
    mapUrl:"https://maps.google.com/?q=9.5703,100.0601"
    }
    
    ]
    
    },
    
    {
    day:9,
    date:"2026-05-01",
    location:"Koh Samui → Koh Tao",
    title:"Ferry rápido",
    
    transport:{
    type:"high-speed ferry",
    company:"Lomprayah",
    duration:"1h 45m",
    priceUSD:35
    },
    
    activities:[
    
    {
    place:"Sairee Beach",
    coordinates:{lat:10.0976,lng:99.8365},
    mapUrl:"https://maps.google.com/?q=10.0976,99.8365"
    }
    
    ]
    
    },
    
    {
    day:10,
    date:"2026-05-02",
    location:"Koh Tao",
    title:"Snorkel Tour",
    
    transport:{
    type:"boat tour",
    duration:"5h",
    priceUSD:30
    },
    
    activities:[
    
    {
    place:"Koh Nang Yuan",
    coordinates:{lat:10.2401,lng:99.8091},
    mapUrl:"https://maps.google.com/?q=10.2401,99.8091"
    },
    
    {
    place:"Shark Bay",
    coordinates:{lat:10.0608,lng:99.8236},
    mapUrl:"https://maps.google.com/?q=10.0608,99.8236"
    }
    
    ]
    
    },
    
    {
    day:12,
    date:"2026-05-04",
    location:"Koh Tao → Bangkok",
    title:"Regreso a Bangkok",
    
    transport:{
    type:"ferry + flight",
    route:"Koh Tao → Chumphon → Bangkok",
    duration:"5h total",
    priceUSD:90
    },
    
    activities:[
    
    {
    place:"Chinatown Bangkok",
    coordinates:{lat:13.7401,lng:100.5070},
    mapUrl:"https://maps.google.com/?q=13.7401,100.5070"
    }
    
    ]
    
    },
    
    {
    day:13,
    date:"2026-05-05",
    location:"Bangkok",
    title:"Templos principales",
    
    activities:[
    
    {
    place:"Grand Palace",
    coordinates:{lat:13.7500,lng:100.4913},
    mapUrl:"https://maps.google.com/?q=13.7500,100.4913"
    },
    
    {
    place:"Wat Pho",
    coordinates:{lat:13.7466,lng:100.4930},
    mapUrl:"https://maps.google.com/?q=13.7466,100.4930"
    },
    
    {
    place:"Wat Arun",
    coordinates:{lat:13.7437,lng:100.4889},
    mapUrl:"https://maps.google.com/?q=13.7437,100.4889"
    }
    
    ]
    
    }
    
    ]