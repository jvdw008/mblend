#Rem
	This is a template example.
	Build this project to see what it does.
	Then change line 24's x value to 2 instead of 0.1
	Build and run again to see the change.
#End
Strict

Import mojo

Class Game Extends App
	Field text:String = "Hello world!"
	Field x:Int = 10, y:Int = 20
	
	' Initialise in here
	Method OnCreate:Int()
		
		Return 0
	End

	' Update variables here
	Method OnUpdate:Int()
		If x <= 640
			x += 0.1
		Else
			x = 0
		End
		
		Return 0
	End

	' Render results to screen
	Method OnRender:Int()
		Cls(0, 0, 0)
		DrawText(text, x, y)
		
		Return 0
	End

End

Function Main:Int()
	New Game
	Return 0
End