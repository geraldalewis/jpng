;(function(){

var car = document.getElementById('car-jpng'),
    notFound = document.getElementById('not-found');

jpng('car-jpng.jpg', 536, 224, function(record){
  var img = new Image();
  img.classList.add('bg-transparent');
  img.src = record.src;
  car.prepend(img);
});

jpng('not-found-jpng.jpg', 100, 100, function(record){
  if (!record.error) throw new Error("Should have created an error property on the object");
  
  var img = new Image();

  if (record.state !== 'error') throw new Error("Record state should be 'error'.");
  else img.setAttribute('data-jpng', 'error');
  img.classList.add('bg-transparent');
  img.width  = record.width;
  img.height = record.height;
  img.src = record.src;
  notFound.prepend(img);
});

}());