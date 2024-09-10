function play2(){

    var sequence = gsap.timeline();
 
  sequence.from(".register",{
    
    opacity:0,
    
 
 },"same")
 
  sequence.from(".logodiv,.registerform",{
    scale:0.8,
    opacity:0.2,
    
 
 },"same")
 
 }
 
 play2();