function init() {
    var $ = go.GraphObject.make;


    var roundedRectangleParams = {
      parameter1: 2,  // cornere rotunjite
      spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight
    };

    Box =
      $(go.Diagram, "BoxDiv",
        {
          "animationManager.initialAnimationStyle": go.AnimationManager.None,
          "InitialAnimationStarting": function(e) {
              var animation = e.subject.defaultAnimation;
              animation.easing = go.Animation.EaseOutExpo;
              animation.duration = 500;
              animation.add(e.diagram, 'scale', 0.1, 1);
              animation.add(e.diagram, 'opacity', 0, 1);
          },


          "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,   // zoom in caseta

          "clickCreatingTool.archetypeNodeData": { text: "node" },     // adaugare data pt nod

          "undoManager.isEnabled": true,    // functie de undo
          positionComputation: function (diagram, pt) {
            return new go.Point(Math.floor(pt.x), Math.floor(pt.y));
          }
        });


    Box.nodeTemplate =

       // nod de pornire
      $(go.Node, "Auto",
        {
          locationSpot: go.Spot.TopCenter,
          isShadowed: true, shadowBlur: 1,
          shadowOffset: new go.Point(0, 8),
          shadowColor: "rgba(0, 0, 0, .14)"
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),

        //  NOD - PROPRIETATI
        $(go.Shape, "Square", roundedRectangleParams,
          {
            name: "SHAPE", fill: "#4dffdb", strokeWidth: 0,
            stroke: null,
            portId: "",
            fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
            toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true,
            cursor: "pointer"
          }),
        $(go.TextBlock,
          {
            font: "bold small-caps 12pt helvetica, bold arial, sans-serif", margin: 7, stroke: "rgba(0, 0, 0, .87)",
            editable: true
          },
          new go.Binding("text").makeTwoWay())
      );


      // contur nod cand selectam
    Box.nodeTemplate.selectionAdornmentTemplate =
      $(go.Adornment, "Spot",
        $(go.Panel, "Auto",
          $(go.Shape, "RoundedRectangle", roundedRectangleParams,
          { fill: null, stroke: "#1986cb", strokeWidth: 2 }),
          $(go.Placeholder)
        ),

        // buton adaugare nod derivat
        $("Button",
          {
            alignment: go.Spot.TopLeft,
            click: addNodeAndLink
          },
          $(go.Shape, "PlusLine", { width: 6, height: 6 })
        )
      );


    function addNodeAndLink(e, obj) {
      var adornment = obj.part;
      var diagram = e.diagram;
      diagram.startTransaction("Add State");


      var fromNode = adornment.adornedPart;
      var fromData = fromNode.data;

      var toData = { text: "new" };    // nume nod copil
      var p = fromNode.location.copy();
      p.y -= 200;        // adaugare nod copil deasupra nod tata
      toData.loc = go.Point.stringify(p);

      var model = diagram.model;
      model.addNodeData(toData);

      //muchia dintre nodul parinte si nodul copil
      var linkdata = {
        from: model.getKeyForNodeData(fromData),
        to: model.getKeyForNodeData(toData),
        text: "edge"
      };

      model.addLinkData(linkdata);  // link intre nod tata si nod copil

      // adaugarea noului nod
      var newnode = diagram.findNodeForData(toData);
      diagram.select(newnode);

      diagram.commitTransaction("Add State");

      //scroll automat daca nodul iese din aria chenarului
      diagram.scrollToRect(newnode.actualBounds);
    }


    // template pt muchii
    Box.linkTemplate =
      $(go.Link,
        {
          curve: go.Link.Bezier,  // proprietati pentru a putea edita muchia
          adjusting: go.Link.Stretch,
          reshapable: true, relinkableFrom: true, relinkableTo: true,
          toShortLength: 3
        },
        new go.Binding("points").makeTwoWay(),
        new go.Binding("curviness"),


        // tip muchie
        $(go.Shape,
          { strokeWidth: 2 },
          new go.Binding('stroke', 'progress', function(progress) {
            return progress ? "#52ce60" : 'black';
          }),
          new go.Binding('strokeWidth', 'progress', function(progress) {
            return progress ? 2.5 : 1.5;
          })
          ),
        $(go.Shape,
          { toArrow: "standard", stroke: null },
          new go.Binding('fill', 'progress', function(progress) {
            return progress ? "#52ce60"  : 'black';
          }),
          ),

          //  text muchie
        $(go.Panel, "Auto",
          $(go.Shape,
            {
              fill: $(go.Brush, "Radial",
                { 0.7: "white", 0.9: "yellow", 1: "rgba(100, 245, 200, 0)" }), //fundal text muchie
              stroke: null
            }),
          $(go.TextBlock, "edge",  // text muchie
            {
              textAlign: "center",
              font: "12pt helvetica, arial, sans-serif",
              margin: 5,
              editable: true
            },

            new go.Binding("text").makeTwoWay())
        )
      );
  }