' hold the left mouse button on the screen to draw particle flames on the screen.
'#Flash
Import mojo

Global screenwidth:Int=640
Global screenheight:Int=480
Global tilewidth:Int=32
Global tileheight:Int=32

Class trail
    Field x1:Float,y1:Float
    Field x2:Float,y2:Float
    Field timeout:Int
    Field maxtimeout:Float=70
    Field alpha:Float=1
    Field deleteme:Bool=False
    Method New(x1:Float,y1:Float,x2:Float,y2:Float)
        Self.x1 = x1
        Self.y1 = y1
        Self.x2 = x2
        Self.y2 = y2
        timeout = maxtimeout
    End Method
    Method update()
        timeout -= 1
        If timeout<0
            deleteme = True
        End If
        ' update the trail with position of ship
        x1 -= Cos(myplayer.ang)*myplayer.thrust
        y1 -= Sin(myplayer.ang)*myplayer.thrust  
        x2 -= Cos(myplayer.ang)*myplayer.thrust
        y2 -= Sin(myplayer.ang)*myplayer.thrust  
        
    End Method
    Method draw()
        alpha = (1.0/maxtimeout)*timeout
        SetAlpha alpha
        SetColor 255,255,255
        DrawLine x1,y1,x2,y2
        SetAlpha 1
    End Method
End Class

Class lineeffect
    Field x1:Int=screenwidth/2
    Field y1:Int=screenheight/2
    Field x2:Int=screenwidth/2
    Field y2:Int=screenheight/2    
    Field deleteme:Bool=False
    Method New()
    End Method
    Method update()
    x1=x1-15
    y1=y1-15
    x2=x2+15
    y2=y2+15
    If x1<-20 Then deleteme=True
    End Method
    Method draw()
        SetAlpha .3
        SetColor 255,255,255
        DrawRect x1,y1,x2-x1,10
        DrawRect x1,y1,10,y2-y1 
        DrawRect x1,y2,x2-x1,10
        DrawRect x2,y1,10,y2-y1
        SetAlpha .2
        SetColor 255,255,255
        If x1>300 Then DrawRect 0,0,screenwidth,screenheight
        SetAlpha 1
    End Method
End Class

Class pickups
    Field px:Float,py:Float
    Field pw:Int=tilewidth/1.5,ph:Int=tileheight/1.5
    Field type:String
    Field ang:Int
    Field deleteme:Bool=False
    Field timeout:Int
    Field timeoutmax:Int=700+Rnd(700)
    Method New(x:Float,y:Float)
        px = x    
        py = y
        type="points"
        If Rnd()<.7 Then
        Select Int(Rnd(0,5))
        Case 0
        type = "points"
        Case 1
        type = "circle"
        Case 2
        type = "backwardsfire"
        Case 3
        type = "tripplefire"
        Case 4
        type = "hull"
        End Select
        End If
    End Method
    Method update()
        ' remove is in to long
        timeout+=1
        If timeout > timeoutmax
            deleteme = True
        End If
        
        ' update the tilemap with the player movement
        px -= Cos(myplayer.ang)*myplayer.thrust
        py -= Sin(myplayer.ang)*myplayer.thrust 
        ang+=3
        If ang>359 Then ang=0
        
        ' collide with player (pickup)
        If rectsoverlap(px,py,pw,ph,screenwidth/2,screenheight/2,tilewidth,tileheight)
            deleteme = True
            mylineeffect.AddLast(New lineeffect())
            If type="points" Then myplayer.score+=15
            If type="circle"
                For Local i=0 To 360 Step 20
                    mybullet.AddLast(New bullet("player","doubledamage",px,py,i,3.3))
                Next
            End If
            If type="backwardsfire"
                myplayer.backwardsfire=True
                myplayer.backwardsfiretime=1000
            End If
            If type="tripplefire"
                myplayer.tripplefire=True
                myplayer.tripplefiretime=1000
            End If
            If type="hull"
                myplayer.hitpoint+=3
                If myplayer.hitpoint > myplayer.maxhitpoint Then  myplayer.hitpoint = myplayer.maxhitpoint
            End If
            Print "Pickup"
        End If
        '
    End Method
    Method draw()
        Select type
            Case "points"
                PushMatrix()
                Translate px,py
                Rotate(-ang)
                Translate -px,-py
                  SetColor 20,20,20
                DrawRect px-pw/2,py-ph/2,pw,ph
                SetColor 255,255,0
                DrawRect (px-pw/2+1),(py-ph/2)+1,pw-2,ph-2
                SetColor 255,255,255
                Scale(2,2)
                DrawText "P",px/2,py/2,.5,.5
                Scale(1,1)
                PopMatrix()
            Case "circle" ' a circle of lasers
                PushMatrix()
                Translate px,py
                Rotate(-ang)
                Translate -px,-py
                  SetColor 20,20,20
                DrawRect px-pw/2,py-ph/2,pw,ph
                SetColor 0,0,255
                DrawRect (px-pw/2+1),(py-ph/2)+1,pw-2,ph-2
                SetColor 255,255,255
                Scale(2,2)
                DrawText "C",px/2,py/2,.5,.5
                Scale(1,1)
                PopMatrix()    
            Case "backwardsfire" 'can fire backwards
                PushMatrix()
                Translate px,py
                Rotate(-ang)
                Translate -px,-py
                  SetColor 20,20,20
                DrawRect px-pw/2,py-ph/2,pw,ph
                SetColor 0,255,255
                DrawRect (px-pw/2+1),(py-ph/2)+1,pw-2,ph-2
                SetColor 255,255,255
                Scale(2,2)
                DrawText "B",px/2,py/2,.5,.5
                Scale(1,1)
                PopMatrix()    
            Case "tripplefire" 'can fire backwards
                PushMatrix()
                Translate px,py
                Rotate(-ang)
                Translate -px,-py
                  SetColor 20,20,20
                DrawRect px-pw/2,py-ph/2,pw,ph
                SetColor 250,155,55
                DrawRect (px-pw/2+1),(py-ph/2)+1,pw-2,ph-2
                SetColor 255,255,255
                Scale(2,2)
                DrawText "T",px/2,py/2,.5,.5
                Scale(1,1)
                PopMatrix() 
            Case "hull" 'can fire backwards
                PushMatrix()
                Translate px,py
                Rotate(-ang)
                Translate -px,-py
                  SetColor 20,20,20
                DrawRect px-pw/2,py-ph/2,pw,ph
                SetColor 250,35,10
                DrawCircle px+1,py,pw/1.6
                SetColor 250,35,10
                DrawRect (px-pw/2+1),(py-ph/2)+1,pw-2,ph-2
                SetColor 255,255,255
                Scale(2,2)
                DrawText "H",px/2,py/2,.5,.5
                Scale(1,1)
                PopMatrix() 
        End Select
    End Method
    Function rectsoverlap:Bool(x1:Int, y1:Int, w1:Int, h1:Int, x2:Int, y2:Int, w2:Int, h2:Int)
        If x1 >= (x2 + w2) Or (x1 + w1) <= x2 Then Return False
        If y1 >= (y2 + h2) Or (y1 + h1) <= y2 Then Return False
        Return True
    End Function     
End Class

Class enemy
    Field type:String    
    Field ex:Float,ey:Float,er:Int
    Field thrust:Float,ang:Int
    Field deleteme:Bool=False
    Field targetx:Int,targety:Int
    Field targetset:Bool=False
    Field state:String
    Field ishome:Bool=False
    Field roaming:Bool=False
    Field homex:Int,homey:Int
    Field firedelay:Int=20,firetime:Int
    Field hitpoint:Int=3
    Field maxhitpoint = 3
    Field gothit:Bool=False
    Field gothittime:Int=20
    Field bombarding:Int=False
    Field maxthrust:Float=3.3
    Field dropfreq:Float=0.4 'lower is less
    Field ffhitpoint:Int=2 'force field hitpoints
    Method New(x:Int,y:Int)
        If Rnd()<.5 Then type="forcefield"
        ex=x
        ey=y
        er=16
        hitpoint=maxhitpoint
        homex = x
        homey = y
        thrust=maxthrust
        state="roam"
    End Method
    Method update()
        'collision with player bullets        
        If gothit = True Then gothittime-=1
        For Local i:=Eachin mybullet
            If i.owner = "player"
                If rectsoverlap(i.bx,i.by,i.bradius,i.bradius,
                                ex-3,ey-3,er+3,er+3)
                    If type="forcefield"
                        If i.type = "doubledamage" Then ffhitpoint-=2 Else ffhitpoint-=1
                        If ffhitpoint<=0 Then type=""
                    Else
                        If i.type = "doubledamage" Then hitpoint-=2 Else hitpoint-=1
                        gothit=True
                        gothittime=20
                        If hitpoint<1 Then 
                            Print "Exploded"
                            If Rnd()<dropfreq Then mypickup.AddLast(New pickups(ex+Cos(ang)*thrust,ey+Sin(ang)*thrust))
                            myp.AddLast(New particleeffect(ex+Cos(ang)*thrust,ey+Sin(ang)*thrust))
                            deleteme = True
                            state=""
                            myplayer.score+=10
                        End If
                        i.deleteme = True
                    End If
                End If
            End If
        Next
        ' states of the enemy
        Select state
            Case "attack"
                If Rnd() < .0005
                    state = "roam"
                    Print "done attacking"
                    ishome=False
                    roaming=False
                End If
                If Rnd()<.1 Then fireatplayer()
                settarget
                If Rnd() < .1 bombard()
                movein
                turn
            Case "roam"    
                If Rnd()<.002                    
                    state="attack"
                    Print "going to attack"
                End If
                roam
                movein
                turn
        End Select
    End Method
    Method fireatplayer()
        Local d:Int=distance(ex,ey,screenwidth/2,screenheight/2)        
        firetime+=1
        If d<250 And firetime > firedelay
            firetime = 0
            Local a:Int=getangle(ex,ey,screenwidth/2,screenheight/2)
            If myplayer.thrust > .5 Then a=ang
            mybullet.AddLast(New bullet("enemy","normal",ex,ey,a,4))
            If Rnd()<.1 Then ' sometimes after shooting head back
                state = "roam"
                Print "done attacking"
                thrust = maxthrust
                ishome=False
                roaming=False
            End If
        End If
    End Method
    Method bombard()
        Local d:Int = distance(ex,ey,screenwidth/2,screenheight/2)
        If bombarding = True And d >220 Then
            thrust = maxthrust
            bombarding = False
            state = "roam"
            ishome=False    
            roaming=False            
        End If
        If myplayer.thrust = 0 And d < 200 And d> 100 And bombarding = False
            thrust = 0
            fireatplayer()
            bombarding = True
        End If
        If bombarding = True
            Local ax:Int=screenwidth/2
            Local ay:Int=screenheight/2
            If Rnd()<.8 And linerectoverlap(ax,ay,ax+Cos(myplayer.ang)*350,ay+Sin(myplayer.ang)*350,ex,ey,er,er)
                Print "scared off"
                thrust = maxthrust
                bombarding = False
                state = "roam"
                ishome=False    
                roaming=False                            
            End If
            fireatplayer()
        End If
    End Method
    Method roam()
        Local dtohome = distance(ex,ey,homex,homey)
        Local dtotarget = distance(ex,ey,targetx,targety)
        If dtohome > 300 And ishome = False And roaming=False
            ishome=True            
            targetx = homex
            targety = homey                
        End If
        If dtohome < 50 And ishome = True And roaming = False
            roaming = True
            targetx = homex+Rnd(-100,100)
            targety = homey+Rnd(-100,100)
        End If
        If dtotarget < 50 And roaming = True
            targetx = homex+Rnd(-100,100)
            targety = homey+Rnd(-100,100)
        End If
        If dtotarget > 300 And roaming=True
            roaming=False
            ishome=False
        End If
    End Method
    Method turn()
        'turn
        Local pangle:Int = getangle(ex,ey,targetx,targety)
        If leftangle(ang,pangle) = True Then ang+=3 Else ang-=3
        If ang>180 Then ang=-180
        If ang<-180 Then ang=180
    End Method

    Method movein()
        'move in
        ex -= Cos(myplayer.ang)*myplayer.thrust
        ey -= Sin(myplayer.ang)*myplayer.thrust        
        ex += Cos(ang)*thrust
        ey += Sin(ang)*thrust
    End Method

    Method settarget()        
        'set target
        Local d:Int=distance(ex,ey,screenwidth/2,screenheight/2)
        If d > 550
            targetx = screenwidth/2
            targety = screenheight/2
            targetset = False
        Else
            If targetset = False
                targetx = (screenwidth/2)+Rnd(-90,90)
                targety = (screenheight/2)+Rnd(-90,90)                
                targetset = True
            End If
        End If
        If d<80 Then 
                targetx = (screenwidth/2)+Rnd(-190,190)
                targety = (screenheight/2)+Rnd(-190,190)                        
        End If
    End Method

    Method draw()
        SetColor 255,0,0
        If gothit = True        
            If gothittime<0 Then gothit=False
            SetColor 255,255,255
        End If
        DrawCircle ex,ey,er
        ' draw the powerbar
        Local x:Float=ex-er
        Local y:Float=ey-er
        Local w1:Float=(er*2)-2
        Local w2:Float=(er*2)
        Local s:Float = w1/maxhitpoint
        w1 = s*hitpoint
        SetColor 0,0,0
        DrawRect x,y,w2,5
        If hitpoint < 2
        SetColor 255,0,0
        Else
        SetColor 255,255,0
        End If
        DrawRect x+2,y+2,w1,3        
        ' draw forcefield
        If type="forcefield"
            SetColor 55,155,255
            SetAlpha .5
            DrawCircle ex-2,ey-2,er+12
            SetAlpha 1
        End If
    End Method
    Function leftangle:Bool(_angle:Int,_destinationangle:Int)
        Local cnt1 = 0    
        Local a1 = _angle
        While a1<>_destinationangle    
            a1+=1
            If a1>180 Then a1=-180
            cnt1+=1
        Wend
        If cnt1<180 Then Return True Else Return False
    End Function    
    Function linerectoverlap:Bool(x1:Int,y1:Int,x2:Int,y2:Int,x3:Int,y3:Int,w:Int,h:Int)
        Local a:Int=getangle(x1,y1,x2,y2)
        Local ax:Float=x1
        Local ay:Float=y1
'        Print x2
'        Print x1+","+ax+Cos(a)*300+","+x2
        Local ex:Bool=False
        While ex=False            
            ax+=Cos(a)*1
            ay+=Sin(a)*1
'            Print ax+","+ay+","+x2+","+y2
            If rectsoverlap(ax-8,ay-8,16,16,x2-8,y2-8,16,16) = True Then ex=True                        
            If rectsoverlap(x3,y3,w,h,ax-6,ay-6,12,12) Then 
                Return True
            End If
        Wend
        Return False
    End Function
    Function getangle:Int(x1:Int,y1:Int,x2:Int,y2:Int)
         Local dx = x2 - x1
         Local dy = y2 - y1
         Return ATan2(dy,dx)+360 Mod 360
    End Function    
    Function distance:Int(x1:Int,y1:Int,x2:Int,y2:Int)
        Return Abs(x2-x1)+Abs(y2-y1)
    End Function    
    Function rectsoverlap:Bool(x1:Int, y1:Int, w1:Int, h1:Int, x2:Int, y2:Int, w2:Int, h2:Int)
        If x1 >= (x2 + w2) Or (x1 + w1) <= x2 Then Return False
        If y1 >= (y2 + h2) Or (y1 + h1) <= y2 Then Return False
        Return True
    End Function    
End Class

Class bullet
    Field deleteme:Bool=False
    Field bx:Float,by:Float,bradius:Float
    Field ang:Int,thrust:Float
    Field time:Int,timeout:Int=100
    Field alpha:Float
    Field owner:String
    Field type:String
    Method New(owner:String,type:String,x:Int,y:Int,angle:Int,thrust:Float)
        Self.type = type
        Self.owner = owner
        Self.ang = angle
        Self.bx = x
        Self.by = y
        Self.thrust = thrust
        bradius = 6
        thrust = 4
    End Method
    Method update()
        time+=1
        bx += Cos(ang)*thrust
        by += Sin(ang)*thrust
        If time > timeout Then deleteme = True
        alpha = 1-(.5/Float(timeout))*time
        ' update the tilemap with the player movement
        bx -= Cos(myplayer.ang)*myplayer.thrust
        by -= Sin(myplayer.ang)*myplayer.thrust         
    End Method
    Method draw()
        SetAlpha alpha
        SetColor 0,0,0
        DrawCircle bx-1,by,bradius+1
        Select owner
            Case "player"
            SetColor 255,0,255        
            Case "enemy"
            SetColor 255,255,0
        End Select
        DrawCircle bx,by,bradius
        Select owner
            Case "player"
            SetColor 255,190,255        
            Case "enemy"
            SetColor 255,255,190
        End Select

        DrawCircle (bx-bradius)+4,(by-bradius)+4,bradius/2
        SetAlpha 1
    End Method
End Class

Class player
    Field score:Int
    Field ang:Float
    Field thrust:Float
    Field turninc:Float
    Field turnincmax:Float=3
    Field turnincmin:Float=-3
    Field maxthrust:Float = 4
    Field firedelay:Int=5
    Field firetime:Int
    Field backwardsfire:Bool=False
    Field backwardsfiretime:Int
    Field tripplefire:Bool=False
    Field tripplefiretime:Int
    Field ship:Float[]=[    -5.0,-5.0,
                         5.0,0.0,
                         -5.0,5.0] 
    Field trailtime:Int=10
    Field hitpoint = 10
    Field maxhitpoint=10
    Method New()    
    End Method
    Method update()
        'shoot
        firetime+=1
        If KeyDown(KEY_SPACE) And firetime > firedelay
            firetime = 0
            mybullet.AddFirst(New bullet("player","Normal",screenwidth/2,screenheight/2,ang,6))
             'should we fire backwards to
            If backwardsfire = True
                Local a:Int=ang
                For Local i=0 Until 180
                a+=1
                If a>359 Then a=0
                Next
                mybullet.AddFirst(New bullet("player","Normal",screenwidth/2,screenheight/2,a,6))
            End If
            If tripplefire = True
                Local a:Int=ang
                For Local i=0 Until 25
                a+=1
                If a>359 Then a=0
                Next
                mybullet.AddFirst(New bullet("player","Normal",screenwidth/2,screenheight/2,a,6))            
                a=ang
                For Local i=0 Until 25
                a-=1
                If a<0 Then a=360
                Next
                mybullet.AddFirst(New bullet("player","Normal",screenwidth/2,screenheight/2,a,6))            

            End If
        End If
        'turn
        If KeyDown(KEY_LEFT) Then turninc-=.2
        If KeyDown(KEY_RIGHT) Then turninc+=.2
        turninc = Clamp(turninc,turnincmin,turnincmax)
        If turninc > .1 Then turninc -= .1
        If turninc < -.1 Then turninc += .1
        If turninc >-.1 And turninc <.1 Then turninc=0
        ang+=turninc
        If ang>359 Then ang=0
        If ang<0 Then ang=359
        'thrust
        If KeyDown(KEY_UP) Then thrust += .1
        If KeyDown(KEY_DOWN) Then thrust -= .1
        If thrust < 0 Then thrust = 0
        If thrust > maxthrust Then thrust = maxthrust
        ' Here the trail is created
        trailtime-=1
        If trailtime<0 Then
            Local x:Int=screenwidth/2
            Local y:Int=screenheight/2
            mytrail.AddLast(New trail(x,y,x+Cos(ang)*12,y+Sin(ang)*12))    
            trailtime=10
        End If

        ' count down backwards fire
        backwardsfiretime-=1
        If backwardsfiretime<0 Then
            backwardsfire=False
        End If
        ' count down trippe fire
        tripplefiretime-=1
        If tripplefiretime<0 Then
            tripplefire=False
        End If
        
        'collision detection with the bullets
        For Local i:=Eachin mybullet
            If i.owner="enemy"
            If rectsoverlap(i.bx,i.by,i.bradius,i.bradius,(screenwidth/2)-3,(screenheight/2)-3,tilewidth-6,tileheight-6)
                i.deleteme = True
                hitpoint -= 1
            End If
            End If
        Next
        
    End Method    
    Method draw()
        PushMatrix()
        Translate screenwidth/2,screenheight/2
        Rotate(-ang)
        Scale(4,4)
        SetColor 255,255,255
        DrawPoly(ship)        
        Translate 0,0
        PopMatrix()  
        SetColor 255,0,0
        DrawLine    screenwidth/2,
                    screenheight/2,
                    screenwidth/2+Cos(ang)*(tilewidth*2),
                    screenheight/2+Sin(ang)*(tileheight*2)
    
    End Method
    Function rectsoverlap:Bool(x1:Int, y1:Int, w1:Int, h1:Int, x2:Int, y2:Int, w2:Int, h2:Int)
        If x1 >= (x2 + w2) Or (x1 + w1) <= x2 Then Return False
        If y1 >= (y2 + h2) Or (y1 + h1) <= y2 Then Return False
        Return True
    End Function      
End Class

Class map
    Field mapx:Float=0
    Field mapy:Float=0
    Field map:Int[][] = [    [0,0,0,1,0,1,0,1,0,1,0,1,0,0,0],
                            [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
                            [0,1,0,1,0,1,0,0,0,1,0,1,0,1,0],
                            [0,1,0,0,0,0,1,1,1,0,0,0,0,1,0],
                            [0,1,0,1,0,0,1,0,1,0,0,1,0,1,0],
                            [0,1,0,0,0,0,1,1,1,0,0,0,0,1,0],
                            [0,1,0,1,0,1,0,0,0,1,0,1,0,1,0],
                            [0,1,0,0,1,0,0,0,0,0,1,0,0,1,0],
                            [0,0,0,1,0,1,0,1,0,1,0,1,0,0,0],
                            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]    
    Field starimage:Image 
    Field starimagew:Int=screenwidth*2
    Field starimageh:Int=screenheight*2
    Field starimagepixels:Int[]                                                                                                                                                                                                                            
    Method New()        
        ' create the background starfield
        starimagepixels = New Int[starimagew*starimageh]
        starimage = CreateImage(starimagew,starimageh)
        createstarimage()        
    End Method
    Method update() 
        ' update the tilemap with the player movement
        mymap.mapx -= Cos(myplayer.ang)*myplayer.thrust
        mymap.mapy -= Sin(myplayer.ang)*myplayer.thrust        
    End Method
    Method createstarimage()
        For Local i=0 Until starimagew*starimageh
            starimagepixels[i] = argb(0,0,0)
        Next
        Local s:Float=255.0/(starimageh/2)
        Local cnt:Float=0
        For Local y = starimageh To starimageh/2 Step -1            
            drawr(0,y,starimagew,1,argb(0,0,255-s*cnt))
            cnt+=1
        Next
        '
        For Local i=0 Until 1000
            Local c:Int=Rnd(10,255)
            Local pos:Int=Rnd(starimagew*starimageh)
            starimagepixels[pos] = argb(c,c,c)
            If Rnd()<.2 Then starimagepixels[pos-1] = argb(c,c,c)
        Next
        ' create the planet in the background
        Local x:Int=screenwidth-90
        Local y:Int=screenheight-90
        drawo(x,y,200,argb(40,20,20))
        drawo(x+10,y+10,195,argb(0,0,0))
    
        starimage.WritePixels(starimagepixels, 0, 0, starimagew, starimageh, 0)
    End Method
    Method draw()    
        SetAlpha 1
        DrawImage starimage,(-screenwidth/2)+(mapx/15),(-screenheight/2)+(mapy/15)        
        For Local y=0 Until 10
        For Local x=0 Until 15
            If map[y][x] = 1
                Local x2:Int=x*tilewidth+mapx
                Local y2:Int=y*tileheight+mapy
                SetColor 155,155,155
                DrawRect    x2,
                            y2,
                            tilewidth,
                            tileheight
                SetColor 255,255,255
                DrawLine x2+2,y2+2,x2+tilewidth-4,y2+2
                DrawLine x2+2,y2+2,x2+2,y2+tileheight-4
                SetColor 55,55,55
                DrawLine x2+4,y2+tileheight-4,x2+tilewidth-8,y2+tileheight-4
                DrawLine x2+tilewidth-4,y2+tileheight-4,x2+tilewidth-4,y2+4
            End If
        Next
        Next
        'drawminimap
        '
        Local s:Float=255/9
        For Local x=0 Until 9
            Local c:Float=Float(x)*s
            SetColor c,c,c
            DrawLine (screenwidth-109)+x,0,(screenwidth-109)+x,103+x
        Next       
        For Local y=0 To 9
            Local c:Float=Float(y)*s
            SetColor c,c,c
            DrawLine (screenwidth-109)+y,109-y,screenwidth,109-y
        Next
        '       
        SetColor 10,10,10
        DrawRect screenwidth-100,1,100,100
        'tilecenter
        SetColor 100,100,100
        Local x:Float = screenwidth-100
        Local y:Float = 1
        x += (100.0/5000)*mymap.mapx
        y += (100.0/5000)*mymap.mapy
        x+=55
        y+=55
'        Print x
        DrawRect x,y,10,10
        ' enemies/drones
        SetColor 255,255,0
        For Local i:=Eachin myenemy
            Local x:Float=screenwidth-100
            Local y:Float=1
            Local sx:Float=100.0/5000
            Local sy:Float=100.0/5000
            x+=(sx*i.ex)+50
            y+=(sy*i.ey)+50
            DrawRect x,y,2,2
        Next
        'player position
        SetColor 255,255,50
        SetAlpha .4
        DrawCircle screenwidth-50+10,50+10,20
        SetAlpha 1
    End Method
    ' makes a noisy oval
    Method drawo(x1,y1,radius,col)        
        For Local y2=-radius To radius
        For Local x2=-radius To radius
            If (y2*y2+x2*x2) <= radius*radius+radius*0.8
                Local x3 = x2+x1
                Local y3 = y2+y1
                Local pc = y3*starimagew+x3
                If pc>=0 And pc < starimagew*starimageh
                    Local r:Int=getred(col)
                    Local g:Int=getgreen(col)
                    Local b:Int=getblue(col)
                    Local rs:Float=Float(255)/9
                    Local gs:Float=Float(255)/9
                    Local bs:Float=Float(255)/9                                        
                    Local r2:Int = r+Rnd(-rs,rs)
                    Local g2:Int = r+Rnd(-gs,gs)                
                    Local b2:Int = r+Rnd(-bs,bs)
                    r2 = Clamp(r2,0,255)
                    g2 = Clamp(g2,0,255)
                    b2 = Clamp(b2,0,255)
                    Local mc:Int=(r2+g2+b2)/3
                    r2=(r2/2)+r/2
                    g2=(g2/2)+g/2
                    b2=(b2/2)+b/2
                    Local col2:Int=argb(r2,g2,b2)
                    starimagepixels[pc] = col2
                End If
            End If
        Next
        Next    
    End Method
    Method drawr(x1,y1,w1,h1,col)
        For Local y2=y1 Until y1+h1
        For Local x2=x1 Until x1+w1
            Local pc = y2*starimagew+x2
            If pc >= 0 And pc < starimagew*starimageh
                starimagepixels[pc] = col
            End If
        Next
        Next 
       End Method
    Function argb:Int(r:Int, g:Int, b:Int ,alpha:Int=255)
       Return (alpha Shl 24) | (r Shl 16) | (g Shl 8) | b          
    End Function
    Function getred:Int(rgba:Int)    
        Return((rgba Shr 16) & $FF)    
    End Function              
    Function getgreen:Int(rgba:Int)    
        Return((rgba Shr 8) & $FF)    
    End Function    
    Function getblue:Int(rgba:Int)    
        Return(rgba & $FF)    
    End Function    
    Function getalpha:Int(rgba:Int)    
        Return ((rgba Shr 24) & $FF)    
    End Function        
End Class

Class particle
    Field x:Float
    Field y:Float
    Field incx:Float
    Field incy:Float
    Field modincx:Float
    Field modincy:Float
    Field sx:Float
    Field sy:Float
    Field sxinc:Float
    Field syinc:Float
    Field timeout:Float
    Field time:Float
    Field alpha:Float
    Field deleteme:Bool=False    
    Method New(x:Int,y:Int,angle:Int)
        Self.x = x
        Self.y = y
        incx = Cos(angle+Rnd(-5,5))
        incy = Sin(angle+Rnd(-5,5))
        timeout = 50+Rnd(20)
        alpha = 1
        modincx = (Cos(angle+Rnd(-5,5)))/100
        modincy = (Sin(angle+Rnd(-5,5)))/100
        Local sc:Float=Rnd(0.5,1)
        sx = sc
        sy = sc
        sxinc = Rnd()/timeout
        syinc = Rnd()/timeout
    End Method
    Method update()
           x -= Cos(myplayer.ang)*myplayer.thrust
        y -= Sin(myplayer.ang)*myplayer.thrust     
    End Method
End Class

Class particleeffect
    Field sw:Int,sh:Int
    Field p:List<particle> = New List<particle>
    Field image:Image
    Field iw:Int=32
    Field ih:Int=32
    Field pixels:Int[]
    Field angle:Int
    Field x:Float,y:Float
    Field deleteme:Bool=False
    Field timeout:Int=50
    Method New(x:Int,y:Int)
        Self.x = x
        Self.y = y
        Self.sw = screenwidth
        Self.sh = screenheight
        pixels = New Int[iw*ih]
        image = CreateImage(iw,ih,image.MidHandle)
        makeimage()
        p.AddFirst(New particle(x,y,Rnd(360)))
    End Method
    Method update()
        timeout-=1
        If timeout < 0 Then deleteme = True        
        If Rnd() < 0.4
            p.AddFirst(New particle(x,y,Rnd(360)))
        End If
        'update the particles with the map movement(player)
          x -= Cos(myplayer.ang)*myplayer.thrust
           y -= Sin(myplayer.ang)*myplayer.thrust             
        For Local i:=Eachin p
            'update the particles with the map movement(player)
              i.x -= Cos(myplayer.ang)*myplayer.thrust
            i.y -= Sin(myplayer.ang)*myplayer.thrust        
            i.x += i.incx
            i.y += i.incy
            i.incx += i.modincx
            i.incy += i.modincy
            i.alpha -= 1/i.timeout
            i.time += 1
            i.sx += i.sxinc
            i.sy += i.syinc
            If i.time > i.timeout Then i.deleteme = True
        Next
        For Local i:=Eachin p
            If i.deleteme = True Then p.Remove(i)
        Next
    End Method
    Method makeimage()
        For Local i=0 To iw        
            Local c:Int = 0+((255/iw)*i)
            drawo(iw/2,ih/2,(iw/2)-(i),argb(c,c,c,255))
        Next
        image.WritePixels(pixels, 0, 0, iw, ih, 0)
    End Method
    Method drawo(x1,y1,radius:Float,col)
        For Local y2=-radius To radius
        For Local x2=-radius To radius
            If (y2*y2+x2*x2) <= radius*radius+radius*0.8
                Local x3 = x2+x1
                Local y3 = y2+y1
                Local pc = y3*iw+x3
                If pc>=0 And pc < iw*ih
                    pixels[pc] = col
                End If
            End If
        Next
        Next    

    End Method

    Method draw()
        SetBlend AdditiveBlend
        SetColor 255,50,0
        For Local i:=Eachin p
            SetAlpha i.alpha
            Local sc:Float=(1/i.timeout)*i.time
            DrawImage(image,i.x,i.y,1,i.sx,i.sy)
        Next
        SetAlpha 1
        SetBlend AlphaBlend
    End Method
    Function argb:Int(r:Int, g:Int, b:Int ,alpha:Int=255)
       Return (alpha Shl 24) | (r Shl 16) | (g Shl 8) | b          
    End Function
    Function getred:Int(rgba:Int)    
        Return((rgba Shr 16) & $FF)    
    End Function              
    Function getgreen:Int(rgba:Int)    
        Return((rgba Shr 8) & $FF)    
    End Function    
    Function getblue:Int(rgba:Int)    
        Return(rgba & $FF)    
    End Function    
    Function getalpha:Int(rgba:Int)    
        Return ((rgba Shr 24) & $FF)    
    End Function    
End Class

Global myplayer:player
Global mymap:map
Global mybullet:List<bullet> = New List<bullet>
Global myenemy:List<enemy> = New List<enemy>
Global myp:List<particleeffect> = New List<particleeffect>
Global mypickup:List<pickups> = New List<pickups>
Global mylineeffect:List<lineeffect> = New List<lineeffect>
Global mytrail:List<trail> = New List<trail>

Class MyGame Extends App
    Method OnCreate()
        SetUpdateRate(60)
        myplayer = New player()
        mymap = New map()        
        For Local i=0 Until 5    
            myenemy.AddLast(New enemy(Rnd(-screenwidth*2,screenwidth*2),Rnd(-screenheight*2,screenheight*2)))
        Next
        For Local i=0 Until 3
        mypickup.AddLast(New pickups(Rnd(300),Rnd(300)))
        Next
        For Local i=0 Until 10
        mypickup.AddLast(New pickups(screenwidth/2+Rnd(-50,50),screenheight/2+Rnd(-50,50)))
        Next
    End Method
    Method OnUpdate() 
        myplayer.update()
        mymap.update()
        
        If MouseDown(MOUSE_LEFT)
            myp.AddLast(New particleeffect(MouseX(),MouseY()))
        End If
        
        'update the trail
        For Local i:=Eachin mytrail
            i.update
        Next
        'update the trail
        For Local i:=Eachin mytrail
            If i.deleteme = True Then mytrail.Remove(i)
        Next
                
        'update the line effects
        For Local i:=Eachin mylineeffect
            i.update
        Next
        For Local i:=Eachin mylineeffect
            If i.deleteme = True Then mylineeffect.Remove(i)
        Next
        
        ' update the pickpups
        For Local i:=Eachin mypickup
            i.update()
        Next        
        For Local i:=Eachin mypickup
            If i.deleteme = True Then mypickup.Remove(i)
        Next 
        ' update the particles
        For Local i:=Eachin myp
            i.update()
        Next        
        For Local i:=Eachin myp
            If i.deleteme = True Then myp.Remove(i)
        Next                 
        For Local i:=Eachin mybullet
            i.update
        Next
        For Local i:=Eachin mybullet
            If i.deleteme = True Then mybullet.Remove(i)
        Next
        For Local i:=Eachin myenemy
            i.update
        Next
        For Local i:=Eachin myenemy
            If i.deleteme = True Then myenemy.Remove(i)
        Next
        ' temp add new enemies if all have died
        Local cnt:Int=0
        For Local i:=Eachin myenemy
            cnt+=1
        Next
        If cnt=0 Then 
            For Local i=0 Until Rnd(5,8)
                myenemy.AddLast(New enemy(Rnd(-screenwidth*2,screenwidth*2),Rnd(-screenheight*2,screenheight*2)))
            Next
            For Local i=0 Until 10
                mypickup.AddLast(New pickups(mymap.mapx+Rnd(300),mymap.mapy+Rnd(300)))
            Next
            
            Print "Added new wave of enemies"
        End If
    End Method
    Method OnRender()
        'Cls 0,0,0  
        mymap.draw()
        'draw the pickups
        For Local i:=Eachin mypickup
            i.draw
        Next           

        For Local i:=Eachin myenemy
            i.draw
        Next           
        For Local i:=Eachin mybullet
            i.draw
        Next           
        'update the particles
        For Local i:=Eachin myp
            i.draw()
        Next        

        'draw the trail
        For Local i:=Eachin mytrail
            i.draw
        Next

        myplayer.draw()
        
        'draw the line effects
        For Local i:=Eachin mylineeffect
            i.draw
        Next

        
        SetColor 255,255,255
        DrawText "Cursor Left/Right/Up/Down/Space",0,0
        DrawText "Score : "+myplayer.score,0,screenheight-15
        DrawText "Hull : "+myplayer.hitpoint,200,screenheight-15        
    End Method
End Class


Function Main()
    New MyGame()
    return 0
End Function