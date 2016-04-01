/**
*
* MOD3  Twist Modifier
*
*
**/

/**[DOC_MD]
 * ###Twist modifier
 *
 * Twist mesh along an axis
 * Adapted from the Twist modifier for PV3D
 *
[/DOC_MD]**/

!function(MOD3, undef){

    var Vector3 = MOD3.Vector3, Matrix4 = MOD3.Matrix4;

    var Distort = MOD3.Distort = MOD3.Class ( MOD3.Modifier, {

        constructor: function( a ) {
            this.$super('constructor');
            this.name = 'Distort';
            this.vector = new Vector3([0, 1, 0]).normalizeSelf( );
            this.angle = (a !== undef) ? a : 0;
            this.center = Vector3.ZERO( );
            this.mat1 = new Matrix4( );
            this.mat2 = new Matrix4( );
            this.scaleAngle = 1;
            this.distortScale = 0
        },

        vector: null,
        angle: 0,
        center: null,
        mat1: null,
        mat2: null,

        dispose: function( ) {
            this.vector.dispose( );
            this.vector = null;
            this.angle = null;
            this.center.dispose( );
            this.center = null;
            this.mat1.dispose( );
            this.mat2.dispose( );
            this.mat1 = null;
            this.mat2 = null;
            this.$super('dispose');

            return this;
        },

        serialize: function( ) {
            return {
                modifier: this.name,
                params: {
                    vector: this.vector.serialize( ),
                    angle: this.angle,
                    center: this.center.serialize( ),
                    mat1: this.mat1.serialize( ),
                    mat2: this.mat2.serialize( ),
                    enabled: !!this.enabled
                }
            };

        },

        tween: function() {
          console.log("tween")
        },

        unserialize: function( json ) {
            if ( json && this.name === json.modifier )
            {
                var params = json.params;
                this.vector.unserialize( params.vector );
                this.angle = params.angle;
                this.center.unserialize( params.center );
                this.mat1.unserialize( params.mat1 );
                this.mat2.unserialize( params.mat2 );
                this.enabled = !!params.enabled;
            }
            return this;
        },

        explode: function(done) {
          this.scaleAngle = 1;
          TweenMax.to(this, 0.8, {scaleAngle:1.1, ease:Expo.easeOut})
          TweenMax.to(this, 2, {scaleAngle:1, ease:Expo.easeInOut, delay:0.69})
          TweenMax.to(this, 0.8, {distortScale:0.2, yoyo:true, repeat:1, ease:Expo.easeOut})
          TweenMax.to(this, 2, {distortScale:0, ease:Expo.easeInOut, delay:0.69, onComplete:done})
        },

        _apply: function( ) {
            var mod = this.mod, vs = mod.vertices, vc = vs.length,
                vector = this.vector, angle = this.angle, center = this.center,
                dv = new Vector3([0.5*mod.maxX, 0.5*mod.maxY, 0.5*mod.maxZ]),
                invdvm = 1.0 / dv.getMagnitude( ),
                factor = invdvm * angle,
                d = -Vector3.dot( vector, center ),
                v, dd, vec
            ;

            var total = vc;

            // optimize loop using while counting down instead of up
            while ( --vc >= 0 )
            {
                v = vs[ vc ];
                if(!v.scale)
                  v.scale = ((total + 1) / (vc + 1))

                if(!v.velocity)
                  v.velocity = 0.3 + Math.random()

                if(!v.scaleMult)
                  v.scaleMult = 1;

                if(!v.distortScale)
                  v.distortScale = 0

                v.distortScale += (this.distortScale - v.distortScale) * (v.velocity<.5 ? 2*v.velocity*v.velocity : -1+2*(2-v.velocity)*v.velocity)

                v.scaleMult = (this.scaleAngle + (v.scale * (v.distortScale)))

                if(v.scaleMult > 3.5)
                  v.scaleMult = 3.5

                vec = v.getVector( );
                vec = vec.multiply(new Vector3(v.scaleMult, v.scaleMult, v.scaleMult))
                dd = Vector3.dot( vec, vector );
                v.setVector( this.twistPoint( vec, vector, dd * factor ) );
            }

            return this;
        },

        twistPoint: function( vertexvector, vector, a ) {
            var mat1 = this.mat1.reset( ).translationMatrixFromVector( vertexvector ),
                mat2 = this.mat2.reset( ).rotationMatrixFromVector( vector, a )
            ;
            mat2.multiply( mat1 );

            return new Vector3([mat2.n14, mat2.n24, mat2.n34]);
        }
    });

}(MOD3);
