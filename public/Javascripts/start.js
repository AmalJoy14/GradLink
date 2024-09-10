function play(){

    var sequence = gsap.timeline();
    
    sequence.from(".mainlogodiv img",{
        delay: 1,
        opacity:0,
        scale:3,
        duration:1.5,
        xPercent:175,
    })
    
     sequence.from(".mainlogodiv>span",{
        opacity:0,
        stagger:0.1
    
     })
     sequence.to(".mainlogodiv>img,.mainlogodiv>span",{
        y:-100,
        
        opacity:0,
        
     },"same") 
     sequence.to(".risediv",{
        delay:0.5,
        y:"-100%",
        duration:1
        
     },"same") 

    }

    play();