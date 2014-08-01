/*
Bookmark locations in the document.
*/

(function ($)
{
    window.divaPlugins.push((function()
    {
        var settings = {};
        var retval =
        {
            init: function(divaSettings, divaInstance)
            {
                // Bookmark the current location if event called
                diva.Events.subscribe("BookmarkCurrentLocation",
                    function()
                    {
                        divaInstance.bookmarkCurrentLocation();
                    });

                // Create the pop-up window.
                $(divaSettings.parentSelector).append('<div class="diva-bookmarks-window"></div>');
                var bookmarksDiv = $(".diva-bookmarks-window");

                // Check if the browser can do local storage
                if (typeof(Storage) !== "undefined") {
                    if (localStorage.getItem("diva-bookmarks") === null)
                    {
                        // Set the empty bookmark list
                        localStorage.setItem("diva-bookmarks", JSON.stringify([]));
                    }
                    // Grab the list
                    var bookmarkObject = JSON.parse(localStorage.getItem("diva-bookmarks"));
                    // Print out the list of bookmarks
                    _render_bookmarks_list();
                } else {
                    // User's browser doesn't support local storage
                    console.log("Browser does not support local storage.");
                    return true;
                }

                // Initialize the window
                _render_bookmark_window();

                function _add_bookmark(pageIndex, name)
                {
                    // The bookmark object that we will save
                    var bookmark = {
                        page: pageIndex,
                        name: name
                    };

                    bookmarkObject.unshift(bookmark);
                    diva.Events.publish("BookmarksUpdated", bookmarkObject);
                    return bookmark;
                }

                /**
                 * Sort the bookmark list by page.
                 *
                 * @private
                 */
                function _sort_bookmarks()
                {
                    bookmarkObject.sort(function(a,b){return a-b;});
                }

                /**
                 * Persist the bookmarks to the user's browser.
                 *
                 * @private
                 */
                function _save_bookmarks()
                {
                    localStorage.setItem("diva-bookmarks",
                        JSON.stringify(bookmarkObject));
                    _render_bookmarks_list();
                }

                /**
                 * Render the entire bookmarks window.
                 *
                 * @private
                 */
                function _render_bookmark_window()
                {
                    // So that we don't have memory leaks
                    bookmarksDiv.empty();

                    var content = '<div class="diva-bookmarks-window-form"><div class="diva-bookmarks-window-toolbar">' +
                        '<div class="diva-bookmarks-window-close" ' +
                        'title="Close the bookmarks window"></div></div>';

                    content += '<h3>Create Bookmark</h3>' +
                        '<form class="create-bookmark">' +
                        '<input type="text" class="bookmark-name" placeholder="Name">' +
                        '<input type="submit" value="Create"></form></div>';

                    content += '<div class="diva-bookmarks-window-list"></div>';
                    // Fill it with the content
                    bookmarksDiv.html(content);

                    bookmarksDiv.find(".create-bookmark").each(
                        function()
                        {
                            $(this).submit(
                                function(event)
                                {
                                    event.preventDefault();
                                    var name = bookmarksDiv.find(".bookmark-name").val();
                                    divaInstance.bookmarkCurrentLocation(name);
                                    alert('Bookmark "' + name + '" created at current location');
                                }
                            );
                        }
                    );
                    bookmarksDiv.find(".diva-bookmarks-window-close").click(
                        function()
                        {
                            bookmarksDiv.hide();
                        }
                    );

                    // Render the list of bookmarks
                    _render_bookmarks_list();
                }

                /**
                 * Render the bookmarks list.
                 *
                 * @private
                 */
                function _render_bookmarks_list()
                {
                    listDiv = $(bookmarksDiv.selector + " .diva-bookmarks-window-list");
                    // So that we don't have memory leaks
                    listDiv.empty();

                    var content = '<h3>Bookmarks</h3><ul>';

                    for (var i = 0; i < bookmarkObject.length; i++)
                    {
                        content += '<li><a href="' + bookmarkObject[i]["page"]
                            + '" class="visit-bookmark">' + bookmarkObject[i]["name"] + '</a> - ' +
                            '<a href="#delete" class="delete-bookmark">' +
                            'Delete</a></li>';
                    }
                    content += "</ul>";
                    // Fill it with the content
                    listDiv.html(content);
                    // Now, we need to bind the event handlers.
                    listDiv.find(".visit-bookmark").each(
                        function(index)
                        {
                            // Trigger the page redirection
                            $(this).click(
                                function(event)
                                {
                                    // We don't want the link to trigger
                                    event.preventDefault();
                                    divaInstance.goToBookmark(index);
                                });
                        }
                    );
                    listDiv.find(".delete-bookmark").each(
                        function(index)
                        {
                            // Trigger the page redirection
                            $(this).click(
                                function(event)
                                {
                                    // We don't want the link to trigger
                                    event.preventDefault();
                                    divaInstance.removeBookmark(index);
                                });
                        }
                    );
                }

                /**
                 * Save Diva's current location as a bookmark.
                 */
                divaInstance.bookmarkCurrentLocation = function(name)
                {
                    if (name === undefined || name === "")
                    {
                        name = "Bookmark " + bookmarkObject.length;
                    }

                    _add_bookmark(divaInstance.getCurrentPageNumber(), name);
                    _save_bookmarks();
                };

                /**
                 * Remove a bookmark from the list of bookmarks.
                 *
                 * @param index 0-indexed integer
                 */
                divaInstance.removeBookmark = function(index)
                {
                    bookmarkObject.splice(index, 1);
                    _save_bookmarks();
                };

                /**
                 *
                 *
                 * @returns array The bookmark array
                 */
                divaInstance.getBookmarks = function()
                {
                    return bookmarkObject;
                };

                /**
                 * Diva goes to the location of the specified bookmark.
                 *
                 * @param index 0-indexed integer
                 */
                divaInstance.goToBookmark = function(index)
                {
                    divaInstance.gotoPageByNumber(bookmarkObject[parseInt(index)].page);
                };

                return true;
            },
            handleClick: function(event)
            {
                $(".diva-bookmarks-window").show();
//                $(".diva-bookmarks").hover(null,function(){$(".diva-bookmarks").hide();});
                return false;
            },
            pluginName: 'bookmark',
            titleText: 'Bookmark document locations'
        };
        return retval;
    })());
})(jQuery);