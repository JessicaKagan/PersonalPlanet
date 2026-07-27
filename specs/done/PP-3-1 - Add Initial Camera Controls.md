The goal of this ticket is to allow users to move around the world we created in **PP-2**. For now, users should be able to pan around the world and zoom in and out. We'll also generate a larger world by default, since that'll ease testing.

We need to do the following tasks:
* This initial iteration of camera controls will be solely controlled by the mouse, so we'll first add support for capturing mouse events.
    * The most important ones for this ticket are the mousewheel handlers. We need to detect when the mousewheel is pressed and released, as well as when it's spun.
    * In addition, we need to detect general mouse movement.
    * We should also add placeholder handlers for left and right clicks. These will save us some time during the future tickets in the **PP-3** sequence.
* While the user has their mousewheel pressed down, they'll be able to pan the camera by moving their mouse. We may want to give this some inertia at some point (i.e, it continues moving for a brief moment afterwards), but it's not a hard requirement for this stage of implementation.
* Users will be able to zoom in and out by spinning the mousewheel. We'll define a minimum and maximum zoom factor, which we can modify in the future.

