let show = true
    const map = new maplibregl.Map({
        container: 'map',
         style: 'https://api.maptiler.com/maps/streets/style.json?key=cA97gdr395y4Uyx3pe0T',
        center: [71.4368897163954, 33.623862044380346],
        zoom: 6.3
    });

    map.on('load', async () => {

        image = await map.loadImage('drone.png');
        map.addImage('drone', image.data);

        map.addSource('strikes', {
            'type': 'geojson',
            'data': 'drone1.geojson'
        });

        map.addLayer({
            'id': 'loco',
            'source': 'strikes',
            'type': 'circle',
            'paint': {
                'circle-radius': [
                    'interpolate', 
                    ['linear'],
                    ['/', ['get', 'max_civ_killed'], 10], // scale total_deaths by 10
                    0, 5,
                    0.5, 8, // when total_deaths is 5, radius should be 10
                    8, 30 // when total_deaths is 10, radius should be 20
                ],
                'circle-color': 'red',
            }
        });

			map.addLayer({
            'id': 'icons',
            'type': 'symbol',
            'source': 'strikes',
            'layout': {
                'icon-image': 'drone',
                'icon-overlap': 'always',
				'icon-size': 0
            } 
        });

        map.on('click', 'loco', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;
            const location = e.features[0].properties.location;
            const district = e.features[0].properties.district;
            const division = e.features[0].properties.division;
            const date = e.features[0].properties.date;
            const total_killed = e.features[0].properties.total_deaths;
            const civ_killed = e.features[0].properties.civ_killed;
            const child_killed = e.features[0].properties.child_killed;
            const injured = e.features[0].properties.injured;
            const target = e.features[0].properties.target;
            const ref1 = e.features[0].properties.ref1;
            const ref2 = e.features[0].properties.ref2;


            const source_link = e.features[0].properties.source_link;
            const source = e.features[0].properties.source;


            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new maplibregl.Popup({ offset: [0, -10]})
                .setLngLat(coordinates)
                .setHTML(`<b>Location:</b> ${location}, ${district}, ${division} 
                          <br>
                          <b>Date:</b> ${date} 
                          <br>
                          <b>Total Deaths:</b> ${total_killed} 
                          <br>
                          <b>Civilians Killed:</b> ${civ_killed} 
                          <br>
                          <b>Children Killed:</b> ${child_killed}
                          <br>
                          <b>Injured:</b> ${injured}
                          <br>
                          <b>Target:</b> ${target}
                          <br>
                          <b>Context:</b> ${description} 
                          <br>
                          <b>Links: </b><a href="${ref1}" target="_blank">Ref1</a>,&nbsp<a href="${ref2}" target="_blank">Ref2</a>
                          <br>
                          
                          <hr>
                          <a href="${source_link}" target="_blank"><p class="set"> <i> ${source}</i> </p> </a>
                `)
                .addTo(map);
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-left'); 
        map.addControl(new maplibregl.FullscreenControl(), 'top-left');
        // map.on('load', function() { 
        //     const legend = new maplibregl.LegendControl({ 
        //         layers: [ 
        //             { 
        //                 layer: 'water', 
        //                 name: 'Water', 
        //                 color: 'red' 
        //             }, 
        //             { 
        //                 layer: 'land', 
        //                 name: 'Land', 
        //                 color: '#00ff00' 
        //             } 
        //         ] 
        //     }); 
        //     map.addControl(legend, 'bottom-left'); 
        // });
        
        map.on('mouseenter', 'loco', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'loco', () => {
            map.getCanvas().style.cursor = '';
        });
    });

    const tooltip = d3.select('body')
    .append('div')
    .attr('class','tooltip')
    
    const button = d3.select('#switch_data')
    
    const container = d3.select('#container');
    const container2 = d3.select('#container2');
    const range = d3.select('#range')
    const presi = d3.selectAll('#presi_legend')

    
    // append SVG
    const svg = container.append('svg');
    const svg2 = container2.append('svg');
    const svg3 = range.append('svg')
    const svg4 = presi.append('svg')

    svgHeight = 440;
    d3.selectAll('svg')
    .attr('height','svgHeight')
    
    //add margin
    const margin_left = 25;
    const margin_top = 20;
    
    //Import the csv
    d3.csv('data.csv').then(function(data){
    
      data.forEach(d => {
        d.st = +d['strikes'];
        d.killed = +d['killed']
        d.range = +d['range']
        d.number = +d['number']
      });
    
      const barLength = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.st)])
        .range([0, 250])
    
      const year_color = d3.scaleOrdinal()
        .domain([])
        .range(['red','red','red','red','red', 'blue','blue','blue','blue','blue','blue','blue','blue', 'orange','orange'])

      const presi_color_rect = d3.scaleOrdinal()
        .domain(['d.number'])
        .range(['','red','blue','orange'])

      const presi_color = d3.scaleOrdinal()
        .domain(['d.president'])
        .range(['','red','blue','orange'])
    
      const bar_color = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.st)])
        .range(['#f9f1f1','red'])
    
      const bar_color_killed = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.killed )])
        .range(['#f9f1f1', 'red'])
    
      svg.style('margin-right','600px')
      svg2.style('margin-right','600px')
      svg4.style('margin-left','950px')

// ............................................
      svg3.selectAll('ranges')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', function(d,i){
          return 12 + (i * 20)
        })
        .attr('cy', 13)
        .attr('r', function(d){
          return d.range
        })
        .attr('fill','red')

// ............................................
        svg4.selectAll('president')
        .data(data)
        .enter()
        .append('rect')
        .attr('width', (d)=>{
          return d.number
        })
        .attr('height', (d)=>{
          return d.number 
        })
        .attr('y', (d,i)=>{
          return (i * 30)
        })
        .attr('fill',(d)=>{
          return presi_color_rect(d.number)
        })

        svg4.selectAll('texter')
        .data(data)
        .enter()
        .append('text')
        .text((d)=>{
          return d.president
        })
        .attr('y', (d,i)=>{
          return 15 + (i * 30)
        })
        .attr('x', 30)
        .attr('fill', (d)=>{
          return presi_color(d.president)
        })
        .style('font-weight','bold')
        
        presi
        // .style('background-color','green')
        .style('max-width','200px')
        .style('height','80px')
// ............................................

      svg.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .text(function(d){
        return d.year
      })
      .attr('fill', function(d){
        return year_color(d.year)
      })
      .attr('x', function(d,i){
        return (i * 60)
      })
      .attr('y',function(d,i){
        return margin_top + 400
      })
      .style('font-size','16px')
    
      
      svg.selectAll('rectangles')
      .data(data)
      .enter()
      .append('rect')
      .attr('width', 20)
      .attr('height', function(d){
        return barLength(d.st)
      })
      .attr('x',function(d,i){
        return 7 + (i * 60)
      })
      .attr('y',function(d,i){
        return svgHeight - barLength(d.st) -45
      })
      .attr('text-anchor', 'middle')
      .attr('fill',function(d){
        return bar_color(d.st)
      })
      .on('mousemove',function(event,d,i){
        d3.select(this).style('opacity',0.5)
        tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px")
        .style('opacity',1)
        .html(`<span style="font-weight: bolder;">${d.year}</span> <hr> US Drone Strikes: <span style="font-weight: bold;">${d.st}</span>`)
      })
      .on('mouseleave',function(evnet,d,i){
        d3.select(this).style('opacity', 1)
        tooltip
        .style('opacity',0)
      })
      .attr('class','rectangles')
    
      svg.selectAll('numbers')
      .data(data)
      .enter()
      .append('text')
      .text(function(d){
        return d.st
      })
      .attr('x',function(d,i){
        return 15 + (i * 60)
      })
      .attr('y',function(d,i){
        return svgHeight - barLength(d.st) -50
      })
      .attr('text-anchor', 'middle')
      .attr('class','numbers')
    
    
    // .......................................  
      
      svg2.selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .text(function(d){
        return d.year
      })
      .attr('fill', function(d){
        return year_color(d.year)
      })
      .attr('x', function(d,i){
        return (i * 60)
      })
      .attr('y',function(d,i){
        return margin_top + 500
      })
      .style('font-size','16px')
    
      
      svg2.selectAll('rectangles')
      .data(data)
      .enter()
      .append('rect')
      .attr('width', 20)
      .attr('height', function(d){
        return barLength(d.killed)
      })
      .attr('x',function(d,i){
        return 7 + (i * 60)
      })
      .attr('y',function(d,i){
        return svgHeight - barLength(d.killed) + 55
      })
      .attr('text-anchor', 'middle')
      .attr('fill',function(d){
        return bar_color_killed(d.killed)
      })
      .on('mousemove',function(event,d,i){
        d3.select(this).style('opacity',0.5)
        tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px")
        .style('opacity',1)
        .html(`<span style="font-weight: bolder;">${d.year}</span> <hr> Civilians Killed: <span style="font-weight: bold;">${d.killed}</span>`)
      })
      .on('mouseleave',function(evnet,d,i){
        d3.select(this).style('opacity', 1)
        tooltip
        .style('opacity',0)
      })
      .attr('class','rectangles')
    
      svg2.selectAll('numbers')
      .data(data)
      .enter()
      .append('text')
      .text(function(d){
        return d.killed
      })
      .attr('x',function(d,i){
        return 15 + (i * 60)
      })
      .attr('y',function(d,i){
        return svgHeight - barLength(d.killed) + 50
      })
      .attr('text-anchor', 'middle')
      .attr('class','numbers')
      
      
      
      
      
      
      
      
      
    //   let isToggled = false;
    
    //   button.on('click',function(){
    
    //     if(isToggled){
    //       d3.select(this)
    //         .text('Change to civilians killed')
    //       svg.selectAll('.rectangles')
    //         .transition()
    //         .duration(500) 
    //         .attr('height',function(d,i){
    //         return barLength(d.st)
    //          })
    //       svg.selectAll('.numbers')
    //         .transition()
    //         .duration(500) 
    //         .attr('y',function(d,i){
    //         return  margin_top + barLength(d.st) + 25
    //         })
    //         .text(d => {
    //           return d.st
    //         })
    //     } else {
    //       d3.select(this)
    //         .text('Change to drone strikes')
    //       svg.selectAll('.rectangles')
    //         .transition()
    //         .duration(500) 
    //         .attr('height', function(d){
    //           return barLength(d.killed)
    //         })
    //         .attr('fill',function(d){
    //           return bar_color_killed(d.killed)
    //         })
    //       svg.selectAll('.numbers')
    //         .transition()
    //         .duration(500) 
    //         .attr('y',function(d,i){
    //         return margin_top + barLength(d.killed) + 25
    //          })
    //         .text(d => {
    //           return d.killed
    //         })
    //     }
    
    //     isToggled = !isToggled
    // })
    
    });

// window.onscroll = function() { myFunction(); };

// const container1 = document.getElementById('container1'); // Removed the '#' symbol
// var sticky = container1.offsetTop;
// var unstickPoint = sticky + (window.innerHeight * 1); // Adjust the multiplier to set the number of pages

// function myFunction() {
//   if (window.pageYOffset > sticky && window.pageYOffset < unstickPoint) {
//     container1.classList.add("sticky");
//   } else {
//     container1.classList.remove("sticky");
//   }
// }
