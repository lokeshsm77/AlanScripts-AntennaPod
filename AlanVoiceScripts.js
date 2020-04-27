visualHints("The easy-to-use, flexible and open-source podcast manager for Android");


let searchPodcast = visual(state => state.screen === "Search Podcast");
let podcastDetails = visual(state => state.screen === "Podcast Details");

intent("Hello Alan", 
       reply("welcome to Antenna podcast manager with Alan voice integration")
      );

searchPodcast = context(() =>{
    title("Search podcast");
    intent(searchPodcast, "Search podcast", 
       reply("What do you want to search",
             follow("Search for (a|the|) $(PODCAST* (.*))", 
                       async p=>{
                            let podcast = p.PODCAST.value;
                            if(podcast === 0){
                                p.play("Can't search on emtpy field")
                            } else if(podcast < 2){
                                p.play("Search text must be 3 characters");
                            } else {
                                p.play({command:"add-text", value:podcast});
                                p.play("Do you want to proceed with the search, Yes or No?")
                                let action = await p.then(confirmSearch);
                                if(action === 'yes'){
                                     p.play({command:"search", value:podcast});
                                } else if(action === 'no'){
                                    p.play({command:"clear-text", value:""});
                                    p.play("Canceling your search");
                                }   
                            }
                        }
                   )
            )
      )
});



let confirmSearch = context(() =>{
    title("Proceed Search Action");
    follow("$(ACT yes|no)", 
                 p=>{  
                     return p.resolve(p.ACT.value);
                 }
          );
    }
);


let podcastResults = context(() =>{
    title("Podcast Results");
    follow("(Select|Tell me the details of|) $(ORDINAL) (th|st|nd|)", 
        p=>{
            if(p.ORDINAL.number > p.userData.userData.count){
                let itemList = (p.userData.userData.count === 1? "item": "items") + " in the list";
                p.play("There are " + p.userData.userData.count + itemList);
            } else{
                p.play({command:"select-podcast", value:p.ORDINAL.number});
                 p.then(podcastFeedOPs);
            }
        }
     );
    
     follow("(go|navigate) back", 
       p=>{
             if((p.visual.screen !== "Search Podcast")){
                p.play("Navigating back to previous screen");
                p.play({command:"go-back", value:"back"});
                p.then(searchPodcast);
             } else {
                p.play("You are in home screen", "Already in Dash board");
             }
        }
      );
    
    fallback("You can select the item from the list, By saying, select 1st, 2nd and so on to select item");
});

let podcastFeedOPs = context(()=>{
    title("Podcast Feed Operations");
  
    intent(podcastDetails, "yes", p=>{
        p.play({command: "read-description", value: "Read description"});
        p.play("reading podcast description");    
    })
    intent(podcastDetails, "close", p=>{
        p.play("Navigating back");
        p.play({command: "go-back", value: "back"});
        p.then(podcastResults);
    })
    intent(podcastDetails, "home", "go home", p=>{
        p.play("Navigating back to home screen");
        p.play({command: "go-home", value: "home"});
        p.then(searchPodcast);
    })
    
    intent(podcastDetails, "no", p=>{
        p.play("Ok");
    })
    
    intent(podcastDetails, "subscribe", p=>{
        p.play({command: "subscribe-podcast", value: "subscribe"});
        p.play("Subscribing the podcast");    
    })
})


let backToSearchPodcast = context(() =>{
    follow("go (back|home|)", 
       p=>{
            p.play({command:"go-back", value:"back"});
            p.play("Navigating back to previous screen");
            p.then(searchPodcast);
        }
      ) 
})


/**
* This mehod is gets called after completing the podcast search, setting result count to userdata.
*/
projectAPI.setPodcastResultCount = (p, param) => {
    p.userData.userData = param;
    if(p.userData.userData.count > 0){
       p.then(podcastResults);
    } else {
        p.then(backToSearchPodcast);
    }
}

function getResultCount(p){
    return p.userData.userData.count;
}


    
 
