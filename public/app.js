var articlesInfo;
$(document).ready(function () {
  // Grab the articles as a json

  $("#scrapeBtn").click(function () {
    if (articlesInfo) {
      $("#articles").empty();
    }

    $.get("/scrape", function (data) {
      $.get("/articles", function (data) {
        articlesInfo = data;
        updateGrid(data);
      });
    });
  });

  $("#showAll").click(function () {
   
    if (articlesInfo) {
      updateGrid(articlesInfo);
    }
    else {
      $.get("/articles", function (data) {
        
        articlesInfo = data;
        //  console.log("articlesInfo",articlesInfo);
        updateGrid(data);
      });
    }
  });


  $("#showSaved").click(function () {
    $.get("/articles", function (data) {
      articlesInfo = data;
      var savedArticles = articlesInfo.filter(function (obj) {
        return obj.saved === true;
      });
      updateGrid(savedArticles);
      // $(".hidediv").hide();
    });

  });

  $("#clearAll").click(function () {
    if (articlesInfo) {
      $("#articles").empty();
    }
  });



  function updateGrid(data) {
    $("#articles").empty();
    for (var i =0; i<20; i++) {
      var articleTitleDiv = "<div class='col-md-8' id='" + data[i]._id + "'>" +
        "<p class='w-100'> " + data[i].title + "</p>" +
        "</div>";

      var notesButtonHtml = "<button type='button' class='btn btn-outline-info noteBtn' " +
        "data-id='#collapse" + i + "' data-objId='"+ data[i]._id + "' data-expanded='false'>" +
        "<i class='fas fa-user-edit'></i>" +
        "<span id='arrowImg" + i + "'><i class='fas fa-angle-right'></i></span> " +
        "</button>";

        // console.log("data[i].saved",data[i].saved);
        if(data[i].saved == true) savedFont = "<i class='fas fa-heart'></i></span> ";
        else savedFont = "<i class='far fa-heart'></i></span> ";
        
      var savedButtonHtml = "<button type='button' class='btn btn-outline-danger saveBtn'" +
        "data-id='" + data[i]._id + "' data-saved='"+ data[i].saved +"'>" +
        "<span id='" + i + "'>"+ savedFont + "</button>";

      var articleButtonDiv = "<div class='col-md-4'>" + notesButtonHtml + savedButtonHtml + "</div>";

      var articleRow = "<div class='row'>" + articleTitleDiv + articleButtonDiv + "</div>";

      var articleImg = "<div class='col-md-4'> " +
      "<img src='" + data[i].imgURL + "'/>" +
        "<p class='pt-3'> Date issued :" + data[i].articleDate.substring(0, 10) + "</p>" +
        "</div>";
  
      var articleNotes = "<h5 class='mt-4'>Name : <input class='w-75' id='name_"+ data[i]._id + "'></p>"+
                          "<h5>Notes : <textarea class='w-75' id='userNotes_"+data[i]._id+"'></textarea></p>"+
                          // "<h5>Last modified on <span id='noteDate_'"+data[i]._id+"'></span></h5>"+
                          "<button type='button' class='btn btn-outline-info saveNotes' id='saveNoteBtn_"+data[i]._id+"'> Save Note</button>";  

      if (data[i].noteData) {
        for( var index in noteData)
        {
          console.log("noteData[index]",noteData[index]);
        }
      }   

      var articleNotesSection = "<div class='col-md-8 text-left' id='notesSection_"+data[i]._id +"'>"+articleNotes +" </div>";
      var notesRow = "<div class='row hidediv' id='collapse" + i + "'>" + articleNotesSection +articleImg  +"</div>";

      var articleDivs = "<div class='row border border-info'> <div class='col-md-12'>" + articleRow + notesRow + "</div></div>";

      $("#articles").append(articleDivs);
      // if (i > 20) return false;
    }
    $(".hidediv").hide();
  }

});

$(document).on('click', '.saveBtn', function () {
  var articleSaved = $(this).attr("data-saved");
  var articleId = $(this).attr("data-id");
  var index = $(this).find("span").attr("id");
  if (articleSaved == 'false') {
    $(this).attr("data-saved", 'true');
    $(this).find("span").html("<i class='fas fa-heart'></i>");
    // console.log("articlesInfo[index]",articlesInfo[index]);
    articlesInfo[index].saved = true;
    saveAs = true;
  }
  else {
    $(this).attr("data-saved", 'false');
    // $(buttonId).hide();
    $(this).find("span").html("<i class='far fa-heart'></i>");
    articlesInfo[index].saved = false;
    saveAs = false;
  }

  $.ajax({
    method: "POST",
    url: "/articles/" + articleId,
    data: { saved: saveAs }
  }).then(function(data) {
      // console.log(data); 
    });

});

$(document).on('click', '.noteBtn', function () {
  var expanded = $(this).attr("data-expanded");
  var buttonId = $(this).attr("data-id");
  var articleId = $(this).attr("data-objId");
  $.ajax({
    method: "GET",
    url: "/articles/notes/" + articleId
    }).then(function(data) {
    $("#notesSection_"+articleId)
      .prepend("<div class='border p-2'><h5> User Name : "+data.userName +"</h5>"+
      "<p> User Notes : "+data.userNotes +"</p>"+
      "<p> Note Created Date : "+data.noteDate.substring(0, 10) +"</p></div>");
  });


  if (expanded == 'false') {
    $(this).attr("data-expanded", 'true');
    $(buttonId).show();
    $(this).find("span").html("<i class='fas fa-angle-down'></i>");
  }
  else {
    $(this).attr("data-expanded", 'false');
    $(buttonId).hide();
    $(this).find("span").html("<i class='fas fa-angle-right'></i>");
  }
});

$(document).on('click', '.saveNotes', function () {
  var objId = $(this).attr("id").split("saveNoteBtn_")[1];
  var usrName = $("#name_"+objId).val();
  var usrNotes = $("#userNotes_"+objId).val();

  $.ajax({
    method: "POST",
    url: "/articles/notes/" + objId,
    data: {
      userName: usrName,
      userNotes: usrNotes,
      noteDate: new Date()
    }
  })
    .then(function(data) {
    $("#showAll").click();
    });
  });

